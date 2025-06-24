import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Move, Maximize2, Type, Image as ImageIcon, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { toast } from 'react-hot-toast';

interface VisualBlogEditorProps {
  content: string;
  onChange: (content: string) => void;
}

interface ContentElement {
  id: string;
  type: 'text' | 'image';
  content: string;
  imageData?: {
    src: string;
    alt: string;
    width: number;
  };
}

export function VisualBlogEditor({ content, onChange }: VisualBlogEditorProps) {
  const [elements, setElements] = useState<ContentElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Parse content into elements
  useEffect(() => {
    const lines = content.split('\n');
    const newElements: ContentElement[] = [];
    let currentTextBlock = '';

    lines.forEach((line, index) => {
      const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      
      if (imageMatch) {
        // If we have accumulated text, add it as a text element
        if (currentTextBlock.trim()) {
          newElements.push({
            id: `text-${Date.now()}-${index}`,
            type: 'text',
            content: currentTextBlock.trim()
          });
          currentTextBlock = '';
        }
        
        // Add image element (only if not base64)
        const [, alt, src] = imageMatch;
        if (!src.startsWith('data:')) {
          newElements.push({
            id: `img-${Date.now()}-${index}`,
            type: 'image',
            content: line,
            imageData: {
              src,
              alt: alt || 'Imagen',
              width: 400
            }
          });
        }
      } else if (line.trim()) {
        currentTextBlock += (currentTextBlock ? '\n' : '') + line;
      }
    });

    // Add any remaining text
    if (currentTextBlock.trim()) {
      newElements.push({
        id: `text-${Date.now()}-final`,
        type: 'text',
        content: currentTextBlock.trim()
      });
    }

    setElements(newElements);
  }, []);

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (editingElement && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      const textarea = textareaRef.current;
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  }, [editingElement]);

  // Convert elements back to content
  const updateContent = useCallback((newElements: ContentElement[]) => {
    const contentParts = newElements.map(element => {
      if (element.type === 'text') {
        return element.content;
      } else {
        return `![${element.imageData?.alt || 'Imagen'}](${element.imageData?.src})`;
      }
    });
    
    const newContent = contentParts.join('\n\n');
    onChange(newContent);
  }, [onChange]);

  // Process image file to URL
  const processImageFile = useCallback(async (file: File): Promise<string> => {
    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen. Por favor intenta nuevamente.');
      throw error;
    }
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList, insertIndex?: number) => {
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        try {
          const imageUrl = await processImageFile(file);
          const fileName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, ' ');
          
          const newImageElement: ContentElement = {
            id: `img-${Date.now()}-${Math.random()}`,
            type: 'image',
            content: `![${fileName}](${imageUrl})`,
            imageData: {
              src: imageUrl,
              alt: fileName,
              width: 400
            }
          };
          
          setElements(prev => {
            const newElements = [...prev];
            const index = insertIndex !== undefined ? insertIndex : newElements.length;
            newElements.splice(index, 0, newImageElement);
            updateContent(newElements);
            return newElements;
          });
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }
    }
  }, [processImageFile, updateContent]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, insertIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files, insertIndex);
    }
  }, [handleFileUpload]);

  // Handle image resize
  const handleImageResize = useCallback((elementId: string, newWidth: number) => {
    setElements(prev => {
      const newElements = prev.map(element => {
        if (element.id === elementId && element.imageData) {
          return {
            ...element,
            imageData: {
              ...element.imageData,
              width: Math.max(100, Math.min(800, newWidth))
            }
          };
        }
        return element;
      });
      updateContent(newElements);
      return newElements;
    });
  }, [updateContent]);

  // Remove element
  const removeElement = useCallback((elementId: string) => {
    setElements(prev => {
      const newElements = prev.filter(element => element.id !== elementId);
      updateContent(newElements);
      return newElements;
    });
    setSelectedElement(null);
    setEditingElement(null);
  }, [updateContent]);

  // Update text content
  const updateTextContent = useCallback((elementId: string, newText: string) => {
    setElements(prev => {
      const newElements = prev.map(element => {
        if (element.id === elementId && element.type === 'text') {
          return { ...element, content: newText };
        }
        return element;
      });
      updateContent(newElements);
      return newElements;
    });
  }, [updateContent]);

  // Add text block
  const addTextBlock = useCallback((insertIndex?: number) => {
    const newTextElement: ContentElement = {
      id: `text-${Date.now()}-${Math.random()}`,
      type: 'text',
      content: ''
    };
    
    setElements(prev => {
      const newElements = [...prev];
      const index = insertIndex !== undefined ? insertIndex : newElements.length;
      newElements.splice(index, 0, newTextElement);
      updateContent(newElements);
      return newElements;
    });

    // Automatically start editing the new text block
    setTimeout(() => {
      setEditingElement(newTextElement.id);
    }, 100);
  }, [updateContent]);

  // Start editing text
  const startEditingText = useCallback((elementId: string) => {
    setEditingElement(elementId);
    setSelectedElement(null);
  }, []);

  // Stop editing text
  const stopEditingText = useCallback(() => {
    setEditingElement(null);
  }, []);

  // Handle click outside to stop editing
  const handleClickOutside = useCallback((e: React.MouseEvent) => {
    if (editingElement && !(e.target as Element).closest('.text-editor')) {
      stopEditingText();
    }
  }, [editingElement, stopEditingText]);

  return (
    <div className="space-y-4" onClick={handleClickOutside}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-secondary-300 hover:border-secondary-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={(e) => handleDrop(e)}
      >
        <Upload className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
        <p className="text-secondary-600 mb-2">
          Arrastra imágenes aquí o{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-primary-950 hover:underline font-medium"
          >
            selecciona archivos
          </button>
        </p>
        <p className="text-xs text-secondary-500">
          Solo verás las imágenes, sin código ni texto markdown
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Visual Content Editor */}
      <div className="border border-secondary-200 rounded-lg overflow-hidden bg-white">
        <div className="bg-secondary-50 px-4 py-2 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-secondary-600">
              <ImageIcon className="h-4 w-4 mr-2" />
              Editor Visual - Solo Imágenes
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => addTextBlock()}
                className="flex items-center px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              >
                <Type className="h-3 w-3 mr-1" />
                Texto
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
              >
                <ImageIcon className="h-3 w-3 mr-1" />
                Imagen
              </button>
            </div>
          </div>
        </div>

        {/* Content Elements */}
        <div className="p-6 min-h-[400px]">
          {elements.length === 0 ? (
            <div className="text-center py-12 text-secondary-400">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-secondary-300" />
              <p className="text-lg mb-2">Tu contenido aparecerá aquí</p>
              <p className="text-sm">Arrastra imágenes o usa los botones de arriba para empezar</p>
            </div>
          ) : (
            <div className="space-y-6">
              {elements.map((element, index) => (
                <div key={element.id} className="relative group">
                  {element.type === 'image' && element.imageData ? (
                    // IMAGE ELEMENT - SOLO LA IMAGEN VISUAL
                    <div 
                      className={`relative inline-block ${selectedElement === element.id ? 'ring-2 ring-primary-500 rounded' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElement(selectedElement === element.id ? null : element.id);
                        setEditingElement(null);
                      }}
                    >
                      <img
                        src={element.imageData.src}
                        alt={element.imageData.alt}
                        style={{ width: `${element.imageData.width}px`, height: 'auto' }}
                        className="rounded shadow-md cursor-pointer max-w-full block"
                      />
                      
                      {/* Image controls - SOLO cuando está seleccionada */}
                      {selectedElement === element.id && (
                        <>
                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeElement(element.id);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                            title="Eliminar imagen"
                          >
                            <X className="h-3 w-3" />
                          </button>

                          {/* Resize handle */}
                          <div
                            className="absolute -bottom-2 -right-2 bg-primary-600 text-white rounded-full p-1 cursor-ew-resize hover:bg-primary-700 transition-colors shadow-lg"
                            title="Redimensionar imagen"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              
                              const startX = e.clientX;
                              const startWidth = element.imageData!.width;

                              const handleMouseMove = (e: MouseEvent) => {
                                const deltaX = e.clientX - startX;
                                handleImageResize(element.id, startWidth + deltaX);
                              };

                              const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                              };

                              document.addEventListener('mousemove', handleMouseMove);
                              document.addEventListener('mouseup', handleMouseUp);
                            }}
                          >
                            <Maximize2 className="h-3 w-3" />
                          </div>

                          {/* Move indicator */}
                          <div className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full p-1 shadow-lg">
                            <Move className="h-3 w-3" />
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    // TEXT ELEMENT
                    <div className="text-editor">
                      {editingElement === element.id ? (
                        // EDITING MODE - Textarea siempre visible
                        <div className="relative">
                          <textarea
                            ref={textareaRef}
                            value={element.content}
                            onChange={(e) => updateTextContent(element.id, e.target.value)}
                            onBlur={(e) => {
                              // Solo salir del modo edición si el click fue fuera del textarea
                              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                stopEditingText();
                              }
                            }}
                            className="w-full p-4 border-2 border-blue-500 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 bg-blue-50"
                            rows={Math.max(3, element.content.split('\n').length + 1)}
                            placeholder="Escribe tu texto aquí..."
                            style={{ minHeight: '80px' }}
                          />
                          <div className="absolute -top-2 -right-2 flex space-x-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                stopEditingText();
                              }}
                              className="bg-green-500 text-white rounded-full p-1 hover:bg-green-600 transition-colors shadow-lg text-xs"
                              title="Guardar texto"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeElement(element.id);
                              }}
                              className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                              title="Eliminar texto"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        // DISPLAY MODE - Texto formateado
                        <div 
                          className="prose max-w-none cursor-pointer hover:bg-blue-50 rounded p-3 transition-colors border border-transparent hover:border-blue-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingText(element.id);
                          }}
                        >
                          {element.content ? (
                            element.content.split('\n').map((line, lineIndex) => {
                              if (line.startsWith('## ')) {
                                return (
                                  <h2 key={lineIndex} className="text-2xl font-bold text-secondary-900 mt-6 mb-4 first:mt-0">
                                    {line.replace('## ', '')}
                                  </h2>
                                );
                              } else if (line.startsWith('### ')) {
                                return (
                                  <h3 key={lineIndex} className="text-xl font-bold text-secondary-900 mt-4 mb-3">
                                    {line.replace('### ', '')}
                                  </h3>
                                );
                              } else if (line.trim()) {
                                return (
                                  <p key={lineIndex} className="text-secondary-700 mb-3 leading-relaxed">
                                    {line}
                                  </p>
                                );
                              }
                              return <div key={lineIndex} className="h-2" />;
                            })
                          ) : (
                            <p className="text-secondary-400 italic">Haz clic para escribir texto...</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Insert buttons between elements */}
                  {editingElement !== element.id && (
                    <div className="flex justify-center space-x-2 my-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => addTextBlock(index + 1)}
                        className="flex items-center px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Texto
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Imagen
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2 flex items-center">
          <ImageIcon className="h-4 w-4 mr-2" />
          ¡Perfecto! Ahora puedes escribir normalmente:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
          <div>
            <h5 className="font-medium mb-1">✅ Cómo escribir texto:</h5>
            <ul className="space-y-1">
              <li>• Haz clic en cualquier texto para editarlo</li>
              <li>• El textarea se mantiene abierto mientras escribes</li>
              <li>• Haz clic en ✓ o fuera para guardar</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-1">✅ Cómo manejar imágenes:</h5>
            <ul className="space-y-1">
              <li>• Solo verás las imágenes reales</li>
              <li>• Haz clic para seleccionar y redimensionar</li>
              <li>• Sin código ni texto base64</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}