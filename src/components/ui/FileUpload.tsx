import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, File as FileIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { storage } from '../../lib/supabase';

interface FileUploadProps {
  bucket: 'tourism-images' | 'avatars' | 'receipts';
  path: string;
  onUploadComplete: (urls: string[]) => void;
  onUploadError: (error: string) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  className?: string;
}

interface FileWithPreview extends globalThis.File {
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  path,
  onUploadComplete,
  onUploadError,
  multiple = false,
  accept = 'image/*',
  maxSize = 10, // 10MB default
  maxFiles = 5,
  className = ''
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = (file: globalThis.File): string | null => {
    // Check if file has required properties
    if (!file || !file.type || !file.name || !file.size) {
      return 'Invalid file object';
    }
    
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      return `File type not allowed. Allowed: ${accept}`;
    }
    
    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    console.log('FileUpload: Processing files:', selectedFiles.length);

    try {
      const newFiles: FileWithPreview[] = Array.from(selectedFiles)
        .filter(file => {
          // Comprehensive file validation
          const isValid = file && 
            file instanceof globalThis.File && 
            file.type && 
            file.name && 
            file.size && 
            file.size > 0;
          
          if (!isValid) {
            console.warn('FileUpload: Invalid file filtered out:', file);
          }
          
          return isValid;
        })
        .map(file => {
          try {
            console.log('FileUpload: Processing file:', file.name, file.type, file.size);
            
            const error = validateFile(file);
            const fileWithPreview: FileWithPreview = {
              ...file,
              status: error ? 'error' : 'pending',
              error: error || undefined
            };

            // Create preview for images - add safety check
            if (file.type && file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = (e) => {
                if (e.target?.result) {
                  fileWithPreview.preview = e.target.result as string;
                }
              };
              reader.readAsDataURL(file);
            }

            return fileWithPreview;
          } catch (error) {
            console.error('FileUpload: Error processing file:', file, error);
            return {
              ...file,
              status: 'error' as const,
              error: 'File processing failed'
            };
          }
        });

      console.log('FileUpload: Valid files after processing:', newFiles.length);

      // Check max files limit
      if (files.length + newFiles.length > maxFiles) {
        onUploadError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      setFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error('FileUpload: Error in handleFileSelect:', error);
      onUploadError('Failed to process selected files');
    }
  }, [files.length, maxFiles, onUploadError]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // Upload files to Supabase
  const uploadFiles = async () => {
    // More robust file filtering
    const validFiles = files.filter(f => {
      const isValid = f && 
        f instanceof globalThis.File && 
        f.status === 'pending' && 
        f.name && 
        f.name.length > 0 && 
        f.type && 
        f.type.length > 0 &&
        f.size && 
        f.size > 0;
      
      if (!isValid) {
        console.warn('FileUpload: Invalid file filtered out during upload:', f);
      }
      
      return isValid;
    });
    
    if (validFiles.length === 0) {
      console.log('FileUpload: No valid files to upload');
      return;
    }

    console.log('FileUpload: Starting upload of', validFiles.length, 'files');
    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of validFiles) {
        // Double-check file validity before processing
        if (!file || !(file instanceof globalThis.File) || !file.name || !file.type) {
          console.error('FileUpload: File validation failed during upload:', file);
          continue;
        }

        console.log('FileUpload: Processing file:', file.name, file.type, file.size);

        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f === file ? { ...f, status: 'uploading' } : f
        ));

        // Generate unique filename with comprehensive safety checks
        const timestamp = Date.now();
        let fileExtension = 'jpg'; // Default fallback
        
        try {
          if (file.name && file.name.includes('.')) {
            const fileNameParts = file.name.split('.');
            if (fileNameParts.length > 1) {
              fileExtension = fileNameParts.pop() || 'jpg';
            }
          }
        } catch (error) {
          console.warn('FileUpload: Error parsing filename, using default extension:', error);
        }
        
        const fileName = `${path}/${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
        console.log('FileUpload: Generated filename:', fileName);

        let uploadResult;
        try {
          if (bucket === 'tourism-images') {
            uploadResult = await storage.uploadTourismImage(file, fileName);
          } else if (bucket === 'avatars') {
            uploadResult = await storage.uploadAvatar(file, fileName);
          } else if (bucket === 'receipts') {
            uploadResult = await storage.uploadReceipt(file, fileName);
          } else {
            throw new Error(`Unknown bucket: ${bucket}`);
          }

          if (uploadResult?.data) {
            let publicUrl: string;
            
            if (bucket === 'receipts') {
              // Receipts don't have public URLs, use direct storage URL
              publicUrl = `${process.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
            } else {
              // Tourism images and avatars have publicUrl in the result
              publicUrl = (uploadResult as any).publicUrl || '';
            }

            uploadedUrls.push(publicUrl);

            // Update status to success
            setFiles(prev => prev.map(f => 
              f === file ? { ...f, status: 'success' } : f
            ));
          }
        } catch (error) {
          console.error('Upload error:', error);
          setFiles(prev => prev.map(f => 
            f === file ? { ...f, status: 'error', error: 'Upload failed' } : f
          ));
        }
      }

      if (uploadedUrls.length > 0) {
        onUploadComplete(uploadedUrls);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all files
  const clearAllFiles = () => {
    setFiles([]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver 
            ? 'border-[#f29520] bg-[#f29520]/10' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {accept === 'image/*' ? 'Images' : 'Files'} up to {maxSize}MB
          {multiple && `, max ${maxFiles} files`}
        </p>
        <button
          type="button"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          className="bg-[#f29520] text-white px-6 py-2 rounded-lg hover:bg-[#e08420] transition-colors"
        >
          Choose Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={(e) => {
            console.log('FileUpload: File input change event:', e.target.files);
            if (e.target.files && e.target.files.length > 0) {
              handleFileSelect(e.target.files);
            }
            // Reset the input value to allow selecting the same file again
            if (e.target) {
              e.target.value = '';
            }
          }}
          onClick={(e) => {
            // Prevent event bubbling that might cause conflicts
            e.stopPropagation();
          }}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Selected Files ({files.filter(f => f && f.name && f.type).length})
            </h3>
            <div className="space-x-2">
              <button
                type="button"
                onClick={uploadFiles}
                disabled={isUploading || files.filter(f => f && f.status === 'pending').length === 0}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </button>
              <button
                type="button"
                onClick={clearAllFiles}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.filter(f => f && f.name && f.type).map((file, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  file.status === 'error' ? 'border-red-200 bg-red-50' :
                  file.status === 'success' ? 'border-green-200 bg-green-50' :
                  file.status === 'uploading' ? 'border-yellow-200 bg-yellow-50' :
                  'border-gray-200 bg-white'
                }`}
              >
                {/* File Preview */}
                <div className="flex items-center space-x-3 mb-3">
                  {file.type && file.type.startsWith('image/') && file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <FileIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name || 'Unknown file'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {file.size ? (file.size / 1024 / 1024).toFixed(2) : '0'} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  {file.status === 'pending' && (
                    <div className="flex items-center text-gray-500">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      <span className="text-xs">Pending</span>
                    </div>
                  )}
                  {file.status === 'uploading' && (
                    <div className="flex items-center text-yellow-600">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600 mr-2"></div>
                      <span className="text-xs">Uploading...</span>
                    </div>
                  )}
                  {file.status === 'success' && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-3 w-3 mr-2" />
                      <span className="text-xs">Uploaded</span>
                    </div>
                  )}
                  {file.status === 'error' && (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="h-3 w-3 mr-2" />
                      <span className="text-xs">{file.error}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
