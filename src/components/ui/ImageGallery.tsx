import React, { useState } from 'react';
import { X, Move, Eye, Trash2, Plus } from 'lucide-react';
import { storage } from '../../lib/supabase';

interface ImageGalleryProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onAddImages?: () => void;
  maxImages?: number;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onImagesChange,
  onAddImages,
  maxImages = 10,
  className = ''
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Delete image
  const handleDeleteImage = async (imageUrl: string, index: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    setIsDeleting(imageUrl);
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const bucket = urlParts.includes('tourism-images') ? 'tourism-images' : 
                    urlParts.includes('avatars') ? 'avatars' : 'receipts';
      
      // Delete from Supabase storage
      await storage.deleteFile(bucket, fileName);
      
      // Remove from local state
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('Failed to delete image. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Reorder images (move up)
  const moveImageUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    onImagesChange(newImages);
  };

  // Reorder images (move down)
  const moveImageDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    onImagesChange(newImages);
  };

  // Set primary image (first image)
  const setPrimaryImage = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [movedImage] = newImages.splice(index, 1);
    newImages.unshift(movedImage);
    onImagesChange(newImages);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Images ({images.length}/{maxImages})
        </h3>
        {onAddImages && images.length < maxImages && (
          <button
            type="button"
            onClick={onAddImages}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#f29520] hover:bg-[#e08420] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f29520] transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Images
          </button>
        )}
      </div>

      {/* Image Grid */}
      {images.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500">No images uploaded yet</p>
          {onAddImages && (
            <button
              type="button"
              onClick={onAddImages}
              className="mt-2 text-[#f29520] hover:text-[#e08420] font-medium"
            >
              Upload your first image
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div
              key={imageUrl}
              className={`relative group border rounded-lg overflow-hidden ${
                index === 0 ? 'ring-2 ring-[#f29520]' : 'border-gray-200'
              }`}
            >
              {/* Primary Image Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#f29520] text-white">
                    Primary
                  </span>
                </div>
              )}

              {/* Image */}
              <img
                src={imageUrl}
                alt={`Image ${index + 1}`}
                className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage(imageUrl)}
              />

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                  {/* View */}
                  <button
                    type="button"
                    onClick={() => setSelectedImage(imageUrl)}
                    className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                    title="View image"
                  >
                    <Eye className="h-4 w-4 text-gray-700" />
                  </button>

                  {/* Move Up */}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImageUp(index)}
                      className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                      title="Move up"
                    >
                      <Move className="h-4 w-4 text-gray-700 rotate-90" />
                    </button>
                  )}

                  {/* Move Down */}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImageDown(index)}
                      className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                      title="Move down"
                    >
                      <Move className="h-4 w-4 text-gray-700 -rotate-90" />
                    </button>
                  )}

                  {/* Set as Primary */}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                      title="Set as primary image"
                    >
                      <div className="w-4 h-4 bg-[#f29520] rounded-full"></div>
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(imageUrl, index)}
                    disabled={isDeleting === imageUrl}
                    className="p-2 bg-red-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors disabled:opacity-50"
                    title="Delete image"
                  >
                    {isDeleting === imageUrl ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="h-4 w-4 text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Image Number */}
              <div className="absolute bottom-2 right-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black bg-opacity-50 text-white text-xs font-medium">
                  {index + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
            >
              <X className="h-6 w-6 text-gray-700" />
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
