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
  position: number;
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
      // Only process if it's not a base64 image and not already in our images array
      if (!src.startsWith('data:') && !images.find(img => img.src === src)) {
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

  // Convert base64 to a simple placeholder and upload to a service (or use a placeholder URL)
  const processImageFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      // For now, we'll use a placeholder service or convert to a shorter reference
      // In a real app, you'd upload to a service like Cloudinary, AWS S3, etc.
      
      // Create a simple filename-based placeholder
      const fileName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '-');
      const timestamp = Date.now();
      const placeholderUrl = `https://images.pexels.com/photos/placeholder-${timestamp}.jpeg`;
      
      // For demo purposes, we'll use a real Pexels image
      // In production, you'd upload the actual file and get a real URL
      const demoImages = [
        'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg',
        'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg',
        'https://images.pexels.com/photos/753339/pexels-photo-753339.jpeg',
        'https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg',
        'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
        'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg',
        'https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg',
        'https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg'
      ];
      
      const randomImage = demoImages[Math.floor(Math.random() * demoImages.length)];
      resolve(randomImage);
    });
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        try {
          // Process the image to get a clean URL (not base64)
          const imageUrl = await processImageFile(file);
          
          const newImage: ImageElement = {
            id: `img-${Date.now()}-${Math.random()}`,
            src: imageUrl,
            alt: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
            width: 300,
            position: cursorPosition
          };
          
          // Insert clean image markdown at cursor position
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
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }
    }
  }, [content, cursorPosition, onChange, processImageFile]);

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
  }, []);

  // Remove image
  const removeImage = useCallback((imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove) {
      // Remove image markdown from content
      const imageMarkdown = `![${imageToRemove.alt}](${imageToRemove.src})`;
      const newContent = content.replace(imageMarkdown, '').replace(/\n\n\n/g, '\n\n'); // Clean up extra line breaks
      onChange(newContent);
      
      setImages(prev => prev.filter(img => img.id !== imageId));
      setSelectedImage(null);
    }
  }, [images, content, onChange]);

  // Clean content from any base64 images that might have slipped through
  const cleanContent = useCallback((rawContent: string) => {
    // Remove any base64 image data
    return rawContent.replace(/!\[([^\]]*)\]\(data:image\/[^)]+\)/g, '');
  }, []);

  // Handle content change with cleaning
  const handleContentChange = useCallback((newContent: string) => {
    const cleaned = cleanContent(newContent);
    onChange(cleaned);
  }, [onChange, cleanContent]);

  // Render content with images as visual elements
  const renderContentWithImages = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, lineIndex) => {
      // Skip empty lines at the beginning
      if (!line.trim() && elements.length === 0) return;
      
      // Check if line contains an image
      const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      
      if (imageMatch) {
        const [, alt, src] = imageMatch;
        // Only render if it's not a base64 image
        if (!src.startsWith('data:')) {
          const image = images.find(img => img.src === src);
          
          elements.push(
            <div key={`img-${lineIndex}`} className="my-6 relative group">
              <div 
                className={`relative inline-block ${selectedImage === image?.id ? 'ring-2 ring-primary-500 rounded' : ''}`}
                onClick={() => setSelectedImage(selectedImage === image?.id ? null : image?.id || null)}
              >
                <img
                  src={src}
                  alt={alt || 'Imagen'}
                  style={{ width: `${image?.width || 300}px`, height: 'auto' }}
                  className="rounded shadow-md cursor-pointer max-w-full"
                />
                
                {/* Image controls */}
                {selectedImage === image?.id && (
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
                {alt || 'Imagen'}
              </p>
            </div>
          );
        }
      } else if (line.trim()) {
        // Regular text line
        if (line.startsWith('## ')) {
          elements.push(
            <h2 key={`h2-${lineIndex}`} className="text-2xl font-bold text-secondary-900 mt-8 mb-4 first:mt-0">
              {line.replace('## ', '')}
            </h2>
          );
        } else if (line.startsWith('### ')) {
          elements.push(
            <h3 key={`h3-${lineIndex}`} className="text-xl font-bold text-secondary-900 mt-6 mb-3">
              {line.replace('### ', '')}
            </h3>
          );
        } else {
          elements.push(
            <p key={`p-${lineIndex}`} className="text-secondary-700 mb-4 leading-relaxed">
              {line}
            </p>
          );
        }
      } else {
        // Empty line for spacing
        elements.push(<div key={`br-${lineIndex}`} className="h-2" />);
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

      {/* Editor */}
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
              onChange={(e) => handleContentChange(e.target.value)}
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