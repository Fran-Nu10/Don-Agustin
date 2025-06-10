import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, RotateCcw, RotateCw, Move, Maximize2 } from 'lucide-react';

interface VisualBlogEditorProps {
  content: string;
  onChange: (content: string) => void;
}

interface ImageElement {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

export function VisualBlogEditor({ content, onChange }: VisualBlogEditorProps) {
  const [images, setImages] = useState<ImageElement[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: ImageElement = {
            id: `img-${Date.now()}-${Math.random()}`,
            src: e.target?.result as string,
            alt: file.name,
            width: 300,
            height: 200,
            x: 50,
            y: 50
          };
          setImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  }, []);

  // Handle drag over editor
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Handle drop on editor
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  // Handle image drag start
  const handleImageDragStart = useCallback((e: React.DragEvent, imageId: string) => {
    setDraggedImage(imageId);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  // Handle image drag end
  const handleImageDragEnd = useCallback((e: React.DragEvent) => {
    if (!editorRef.current || !draggedImage) return;

    const editorRect = editorRef.current.getBoundingClientRect();
    const newX = e.clientX - editorRect.left - dragOffset.x;
    const newY = e.clientY - editorRect.top - dragOffset.y;

    setImages(prev => prev.map(img => 
      img.id === draggedImage 
        ? { ...img, x: Math.max(0, newX), y: Math.max(0, newY) }
        : img
    ));

    setDraggedImage(null);
  }, [draggedImage, dragOffset]);

  // Handle image resize
  const handleImageResize = useCallback((imageId: string, newWidth: number, newHeight: number) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, width: Math.max(50, newWidth), height: Math.max(50, newHeight) }
        : img
    ));
  }, []);

  // Remove image
  const removeImage = useCallback((imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    setSelectedImage(null);
  }, []);

  // Generate content with images
  const generateContent = useCallback(() => {
    let generatedContent = content;
    
    images.forEach(img => {
      const imageMarkdown = `\n![${img.alt}](${img.src})\n`;
      if (!generatedContent.includes(imageMarkdown)) {
        generatedContent += imageMarkdown;
      }
    });
    
    onChange(generatedContent);
  }, [content, images, onChange]);

  // Update content when images change
  React.useEffect(() => {
    generateContent();
  }, [images]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center transition-colors hover:border-secondary-400"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
        <p className="text-secondary-600 mb-2">
          Arrastra imágenes aquí o{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-primary-950 hover:underline"
          >
            selecciona archivos
          </button>
        </p>
        <p className="text-xs text-secondary-500">
          Las imágenes aparecerán en el editor visual abajo
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

      {/* Visual Editor */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-secondary-900">
          Editor Visual de Contenido
        </label>
        
        <div
          ref={editorRef}
          className="relative min-h-[400px] border border-secondary-300 rounded-lg bg-white overflow-hidden"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Background text area */}
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full p-4 bg-transparent border-none resize-none focus:outline-none z-10"
            placeholder="Escribe tu contenido aquí... También puedes arrastrar imágenes directamente a esta área."
            style={{ minHeight: '400px' }}
          />

          {/* Images overlay */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {images.map((image) => (
              <div
                key={image.id}
                className={`absolute pointer-events-auto cursor-move ${
                  selectedImage === image.id ? 'ring-2 ring-primary-500' : ''
                }`}
                style={{
                  left: image.x,
                  top: image.y,
                  width: image.width,
                  height: image.height,
                }}
                draggable
                onDragStart={(e) => handleImageDragStart(e, image.id)}
                onDragEnd={handleImageDragEnd}
                onClick={() => setSelectedImage(image.id)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover rounded shadow-lg"
                  draggable={false}
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
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>

                    {/* Resize handles */}
                    <div
                      className="absolute -bottom-2 -right-2 bg-primary-500 text-white rounded-full p-1 cursor-se-resize hover:bg-primary-600 transition-colors"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsResizing(true);
                        
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startWidth = image.width;
                        const startHeight = image.height;

                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaX = e.clientX - startX;
                          const deltaY = e.clientY - startY;
                          
                          handleImageResize(
                            image.id,
                            startWidth + deltaX,
                            startHeight + deltaY
                          );
                        };

                        const handleMouseUp = () => {
                          setIsResizing(false);
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      <Maximize2 className="h-3 w-3" />
                    </div>

                    {/* Move handle */}
                    <div className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full p-1 cursor-move hover:bg-blue-600 transition-colors">
                      <Move className="h-3 w-3" />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Drop zone indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="text-secondary-400 text-center">
              <Upload className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="opacity-20">Arrastra imágenes aquí para insertarlas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Cómo usar el editor visual:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Arrastra imágenes directamente al área del editor</li>
          <li>• Haz clic en una imagen para seleccionarla y ver los controles</li>
          <li>• Usa el ícono de mover (azul) para reposicionar la imagen</li>
          <li>• Usa el ícono de redimensionar (naranja) para cambiar el tamaño</li>
          <li>• Usa el ícono X (rojo) para eliminar la imagen</li>
          <li>• Escribe tu contenido normalmente en el área de texto</li>
        </ul>
      </div>
    </div>
  );
}