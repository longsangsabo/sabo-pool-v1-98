import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { Upload, Image, Receipt, FileText, X, CheckCircle } from 'lucide-react';
import { Challenge, VerifyChallengeRequest } from '../types/challenge';
import { supabase } from '../integrations/supabase/client';

interface ChallengeVerificationModalProps {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export const ChallengeVerificationModal: React.FC<
  ChallengeVerificationModalProps
> = ({ challenge, isOpen, onClose, onVerified }) => {
  const [verificationType, setVerificationType] = useState<
    'image' | 'receipt' | 'other'
  >('image');
  const [images, setImages] = useState<File[]>([]);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [description, setDescription] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (const image of images) {
      const fileName = `challenge-verification/${challenge?.id}/${Date.now()}-${image.name}`;

      const { data, error } = await supabase.storage
        .from('verification-images')
        .upload(fileName, image);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('verification-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!challenge) return;

    setLoading(true);
    setError(null);

    try {
      const verificationData: any = {};

      if (verificationType === 'image') {
        if (images.length === 0) {
          throw new Error('Vui lòng upload ít nhất một hình ảnh');
        }
        const imageUrls = await uploadImages();
        verificationData.images = imageUrls;
      } else if (verificationType === 'receipt') {
        if (!receiptNumber.trim()) {
          throw new Error('Vui lòng nhập số hóa đơn');
        }
        verificationData.receipt_number = receiptNumber;
        if (images.length > 0) {
          const imageUrls = await uploadImages();
          verificationData.images = imageUrls;
        }
      } else {
        if (!description.trim()) {
          throw new Error('Vui lòng nhập mô tả');
        }
        verificationData.description = description;
        if (images.length > 0) {
          const imageUrls = await uploadImages();
          verificationData.images = imageUrls;
        }
      }

      if (additionalNotes.trim()) {
        verificationData.additional_notes = additionalNotes;
      }

      const { error } = await supabase
        .from('challenges')
        .update({ status: 'verified' })
        .eq('id', challenge.id);

      if (error) throw error;

      onVerified();
      onClose();
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to verify challenge'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setVerificationType('image');
    setImages([]);
    setReceiptNumber('');
    setDescription('');
    setAdditionalNotes('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!challenge) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <CheckCircle className='w-5 h-5 text-green-600' />
            Xác minh thách đấu
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Challenge Info */}
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='font-semibold mb-2'>Thông tin thách đấu</h3>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-gray-600'>Người thách:</span>
                <div className='font-medium'>
                  {challenge.challenger?.full_name}
                </div>
              </div>
              <div>
                <span className='text-gray-600'>Đối thủ:</span>
                <div className='font-medium'>
                  {challenge.opponent?.full_name}
                </div>
              </div>
              <div>
                <span className='text-gray-600'>CLB:</span>
                <div className='font-medium'>{challenge.club?.name}</div>
              </div>
              <div>
                <span className='text-gray-600'>Điểm cược:</span>
                <div className='font-medium'>{challenge.bet_points}</div>
              </div>
            </div>
          </div>

          {/* Verification Type */}
          <div className='space-y-2'>
            <Label>Loại xác minh</Label>
            <Select
              value={verificationType}
              onValueChange={(value: any) => setVerificationType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='image'>
                  <div className='flex items-center gap-2'>
                    <Image className='w-4 h-4' />
                    <span>Hình ảnh</span>
                  </div>
                </SelectItem>
                <SelectItem value='receipt'>
                  <div className='flex items-center gap-2'>
                    <Receipt className='w-4 h-4' />
                    <span>Hóa đơn</span>
                  </div>
                </SelectItem>
                <SelectItem value='other'>
                  <div className='flex items-center gap-2'>
                    <FileText className='w-4 h-4' />
                    <span>Khác</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload */}
          {verificationType === 'image' && (
            <div className='space-y-2'>
              <Label>Hình ảnh xác minh</Label>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-4'>
                <div className='flex items-center justify-center'>
                  <div className='text-center'>
                    <Upload className='w-8 h-8 mx-auto text-gray-400 mb-2' />
                    <p className='text-sm text-gray-600 mb-2'>
                      Kéo thả hình ảnh hoặc click để chọn
                    </p>
                    <Input
                      type='file'
                      accept='image/*'
                      multiple
                      onChange={handleImageUpload}
                      className='hidden'
                      id='image-upload'
                    />
                    <Label htmlFor='image-upload' className='cursor-pointer'>
                      <Button variant='outline' size='sm'>
                        Chọn hình ảnh
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>

              {images.length > 0 && (
                <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                  {images.map((image, index) => (
                    <div key={index} className='relative'>
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className='w-full h-24 object-cover rounded-lg'
                      />
                      <Button
                        size='sm'
                        variant='destructive'
                        className='absolute top-1 right-1 w-6 h-6 p-0'
                        onClick={() => removeImage(index)}
                      >
                        <X className='w-3 h-3' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Receipt Number */}
          {verificationType === 'receipt' && (
            <div className='space-y-2'>
              <Label htmlFor='receipt-number'>Số hóa đơn</Label>
              <Input
                id='receipt-number'
                placeholder='Nhập số hóa đơn...'
                value={receiptNumber}
                onChange={e => setReceiptNumber(e.target.value)}
              />

              <div className='space-y-2'>
                <Label>Hình ảnh hóa đơn (tùy chọn)</Label>
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-4'>
                  <div className='flex items-center justify-center'>
                    <div className='text-center'>
                      <Receipt className='w-8 h-8 mx-auto text-gray-400 mb-2' />
                      <p className='text-sm text-gray-600 mb-2'>
                        Upload hình ảnh hóa đơn
                      </p>
                      <Input
                        type='file'
                        accept='image/*'
                        multiple
                        onChange={handleImageUpload}
                        className='hidden'
                        id='receipt-upload'
                      />
                      <Label
                        htmlFor='receipt-upload'
                        className='cursor-pointer'
                      >
                        <Button variant='outline' size='sm'>
                          Chọn hình ảnh
                        </Button>
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {verificationType === 'other' && (
            <div className='space-y-2'>
              <Label htmlFor='description'>Mô tả</Label>
              <Textarea
                id='description'
                placeholder='Mô tả cách xác minh thách đấu...'
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />

              <div className='space-y-2'>
                <Label>Hình ảnh bổ sung (tùy chọn)</Label>
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-4'>
                  <div className='flex items-center justify-center'>
                    <div className='text-center'>
                      <Image className='w-8 h-8 mx-auto text-gray-400 mb-2' />
                      <p className='text-sm text-gray-600 mb-2'>
                        Upload hình ảnh bổ sung
                      </p>
                      <Input
                        type='file'
                        accept='image/*'
                        multiple
                        onChange={handleImageUpload}
                        className='hidden'
                        id='other-upload'
                      />
                      <Label htmlFor='other-upload' className='cursor-pointer'>
                        <Button variant='outline' size='sm'>
                          Chọn hình ảnh
                        </Button>
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Notes */}
          <div className='space-y-2'>
            <Label htmlFor='additional-notes'>Ghi chú bổ sung (tùy chọn)</Label>
            <Textarea
              id='additional-notes'
              placeholder='Thêm thông tin bổ sung...'
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-red-600 text-sm'>{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className='flex gap-3'>
            <Button
              onClick={handleSubmit}
              className='flex-1'
              disabled={loading}
            >
              {loading ? 'Đang xác minh...' : 'Xác minh thách đấu'}
            </Button>

            <Button variant='outline' onClick={handleClose} disabled={loading}>
              Hủy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
