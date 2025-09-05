import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import FileUpload from './FileUpload';
import ImageGallery from './ImageGallery';

interface ImageManagerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  bucket: 'tourism-images' | 'avatars' | 'receipts';
  path: string;
  maxImages?: number;
  className?: string;
}

const ImageManager: React.FC<ImageManagerProps> = ({
  images,
  onImagesChange,
  bucket,
  path,
  maxImages = 10,
  className = ''
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadComplete = (urls: string[]) => {
    console.log('ImageManager: Upload complete, URLs:', urls);
    const newImages = [...images, ...urls];
    onImagesChange(newImages);
    setShowUploadModal(false);
  };

  const handleUploadError = (error: string) => {
    console.error('ImageManager: Upload error:', error);
    alert(`Upload failed: ${error}`);
  };

  const handleCloseModal = () => {
    console.log('ImageManager: Closing upload modal');
    setShowUploadModal(false);
  };

  const handleOpenModal = () => {
    console.log('ImageManager: Opening upload modal');
    setShowUploadModal(true);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Images */}
      <ImageGallery
        images={images}
        onImagesChange={onImagesChange}
        onAddImages={handleOpenModal}
        maxImages={maxImages}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#f29520] rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Upload Images</h3>
                  <p className="text-sm text-gray-500">
                    Add images to {bucket.replace('-', ' ')} ({images.length}/{maxImages})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content - Single FileUpload Component */}
            <div className="p-6" onClick={(e) => e.stopPropagation()}>
              <FileUpload
                key={`upload-${bucket}-${path}`} // Ensure unique key
                bucket={bucket}
                path={path}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                multiple={true}
                accept="image/*"
                maxSize={10}
                maxFiles={Math.max(1, maxImages - images.length)}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageManager;