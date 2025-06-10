import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Move, Maximize2, Type, Image as ImageIcon } from 'lucide-react';

interface VisualBlogEditorProps {
  content: string;
  onChange: (content: string) => void;
}

interface ImageElement {
  id: string;
  src: string;
  alt: string;
  width: number;
  position: number; // Position in text (character index)
}

export function VisualBlogEditor({ content, onChange }: VisualBlogEditorProps) {
  const [images, setImages] = useState<ImageElement[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse existing images from content
  useEffect(() => {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const foundImages: ImageElement[] = [];
    let match;
    
    while ((match = imageRegex.exec(content)) !== null) {
      const [fullMatch, alt, src] = match;
      // Only process if it's not already in our images array
      if (!images.find(img => img.src === src)) {
        foundImages.push({
          id: `img-${Date.now()}-${Math.random()}`,
          src,
          alt: alt || 'Imagen',
          width: 300,
          position: match.index
        });
      }
    }
    
    if (foundImages.length > 0) {
      setImages(prev => [...prev, ...foundImages]);
    }
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          const newImage: ImageElement = {
            id: `img-${Date.now()}-${Math.random()}`,
            src: imageUrl,
            alt: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
            width: 300,
            position: cursorPosition
          };
          
          // Insert image markdown at cursor position
          const beforeCursor = content.substring(0, cursorPosition);
          const afterCursor = content.substring(cursorPosition);
          const imageMarkdown = `\n![${newImage.alt}](${newImage.src})\n`;
          const newContent = beforeCursor + imageMarkdown + afterCursor;
          
          setImages(prev => [...prev, newImage]);
          onChange(newContent);
          
          // Update cursor position to after the inserted image
          setTimeout(() => {
            if (textareaRef.current) {
              const newPosition = cursorPosition + imageMarkdown.length;
              textareaRef.current.setSelectionRange(newPosition, newPosition);
              setCursorPosition(newPosition);
            }
          }, 0);
        };
        reader.readAsDataURL(file);
      }
    });
  }, [content, cursorPosition, onChange]);

  // Handle cursor position change
  const handleCursorChange = useCallback(() => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  }, []);

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
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  // Handle image resize
  const handleImageResize = useCallback((imageId: string, newWidth: number) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, width: Math.max(100, Math.min(800, newWidth)) }
        : img
    ));
    
    // Update content with new width (if we want to store width in markdown)
    // For now, we'll just update the visual representation
  }, []);

  // Remove image
  const removeImage = useCallback((imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove) {
      // Remove image markdown from content
      const imageMarkdown = `![${imageToRemove.alt}](${imageToRemove.src})`;
      const newContent = content.replace(imageMarkdown, '');
      onChange(newContent);
      
      setImages(prev => prev.filter(img => img.id !== imageId));
      setSelectedImage(null);
    }
  }, [images, content, onChange]);

  // Render content with images as visual elements
  const renderContentWithImages = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, lineIndex) => {
      // Check if line contains an image
      const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      
      if (imageMatch) {
        const [, alt, src] = imageMatch;
        const image = images.find(img => img.src === src);
        
        if (image) {
          elements.push(
            <div key={`img-${lineIndex}`} className="my-4 relative group">
              <div 
                className={`relative inline-block ${selectedImage === image.id ? 'ring-2 ring-primary-500 rounded' : ''}`}
                onClick={() => setSelectedImage(selectedImage === image.id ? null : image.id)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  style={{ width: `${image.width}px`, height: 'auto' }}
                  className="rounded shadow-md cursor-pointer"
                />
                
                {/* Image controls */}
                {selectedImage === image.id && (
                  <>
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(image.id);
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
                        const startWidth = image.width;

                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaX = e.clientX - startX;
                          handleImageResize(image.id, startWidth + deltaX);
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
              
              {/* Image caption */}
              <p className="text-sm text-secondary-500 mt-2 text-center italic">
                {image.alt}
              </p>
            </div>
          );
        }
      } else if (line.trim()) {
        // Regular text line
        if (line.startsWith('## ')) {
          elements.push(
            <h2 key={`h2-${lineIndex}`} className="text-2xl font-bold text-secondary-900 mt-6 mb-3">
              {line.replace('## ', '')}
            </h2>
          );
        } else if (line.startsWith('### ')) {
          elements.push(
            <h3 key={`h3-${lineIndex}`} className="text-xl font-bold text-secondary-900 mt-4 mb-2">
              {line.replace('### ', '')}
            </h3>
          );
        } else {
          elements.push(
            <p key={`p-${lineIndex}`} className="text-secondary-700 mb-3 leading-relaxed">
              {line}
            </p>
          );
        }
      } else {
        // Empty line
        elements.push(<div key={`br-${lineIndex}`} className="h-3" />);
      }
    });
    
    return elements;
  };

  return (
    <div className="space-y-4">
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
        onDrop={handleDrop}
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
          Las imágenes se insertarán donde esté el cursor en el texto
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

      {/* Editor Tabs */}
      <div className="border border-secondary-200 rounded-lg overflow-hidden">
        <div className="bg-secondary-50 px-4 py-2 border-b border-secondary-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-secondary-600">
              <Type className="h-4 w-4 mr-2" />
              Editor de Contenido
            </div>
            <div className="text-xs text-secondary-500">
              Posición del cursor: {cursorPosition}
            </div>
          </div>
        </div>

        {/* Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
          {/* Text Editor */}
          <div className="border-r border-secondary-200">
            <div className="bg-secondary-100 px-3 py-2 text-sm font-medium text-secondary-700 border-b border-secondary-200">
              Editar Texto
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              onSelect={handleCursorChange}
              onKeyUp={handleCursorChange}
              onClick={handleCursorChange}
              className="w-full h-full p-4 border-none resize-none focus:outline-none font-mono text-sm"
              placeholder="Escribe tu contenido aquí...

Usa ## para títulos principales
Usa ### para subtítulos

Las imágenes aparecerán como ![alt](url) y se mostrarán en la vista previa."
              style={{ minHeight: '460px' }}
            />
          </div>

          {/* Visual Preview */}
          <div>
            <div className="bg-secondary-100 px-3 py-2 text-sm font-medium text-secondary-700 border-b border-secondary-200 flex items-center">
              <ImageIcon className="h-4 w-4 mr-2" />
              Vista Previa
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: '460px' }}>
              {content.trim() ? (
                <div className="prose max-w-none">
                  {renderContentWithImages()}
                </div>
              ) : (
                <div className="text-secondary-400 italic text-center py-8">
                  La vista previa aparecerá aquí cuando escribas contenido...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <ImageIcon className="h-4 w-4 mr-2" />
          Cómo usar el editor:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h5 className="font-medium mb-1">Insertar imágenes:</h5>
            <ul className="space-y-1">
              <li>• Coloca el cursor donde quieres la imagen</li>
              <li>• Arrastra la imagen al área de carga</li>
              <li>• La imagen se insertará automáticamente</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-1">Editar imágenes:</h5>
            <ul className="space-y-1">
              <li>• Haz clic en una imagen para seleccionarla</li>
              <li>• Arrastra desde la esquina para redimensionar</li>
              <li>• Usa el botón X para eliminar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}