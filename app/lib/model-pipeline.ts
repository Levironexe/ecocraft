import { createServiceClient } from './supabase';
import { generateImageBuffer } from './leonardo';
import { createImageTo3DTask, pollMeshyTask, downloadGlb } from './meshy';
import { SelectedItem } from './types';
import { createHash } from 'crypto';

function hashMaterialCombo(items: SelectedItem[]): string {
  const normalized = items
    .map((i) => `${i.materialId}:${i.quantity}`)
    .sort()
    .join('|');
  return createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

export interface PipelineResult {
  glbUrl: string;
  referenceImageUrl?: string;
  fromCache: boolean;
}

export interface PipelineProgress {
  stage: 'checking-cache' | 'generating-image' | 'generating-3d' | 'uploading' | 'done' | 'error';
  message: string;
}

export async function checkModelCache(
  selectedItems: SelectedItem[]
): Promise<{ glbUrl: string; referenceImageUrl?: string } | null> {
  const hash = hashMaterialCombo(selectedItems);
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('generated_models')
    .select('glb_storage_path')
    .eq('material_combo_hash', hash)
    .single();

  if (data?.glb_storage_path) {
    const { data: urlData } = supabase.storage
      .from('models')
      .getPublicUrl(data.glb_storage_path);
    const refPath = data.glb_storage_path.replace('.glb', '-ref.png');
    const { data: refUrlData } = supabase.storage
      .from('models')
      .getPublicUrl(refPath);
    return { glbUrl: urlData.publicUrl, referenceImageUrl: refUrlData?.publicUrl };
  }

  return null;
}

export async function generateAndStoreModel(
  selectedItems: SelectedItem[],
  craftName: string,
  craftDescription: string,
  imagePrompt: string,
  onProgress?: (progress: PipelineProgress) => void
): Promise<PipelineResult> {
  const hash = hashMaterialCombo(selectedItems);
  const supabase = createServiceClient();

  onProgress?.({ stage: 'checking-cache', message: 'Kiểm tra kho mô hình...' });
  const cached = await checkModelCache(selectedItems);
  if (cached) {
    onProgress?.({ stage: 'done', message: 'Tìm thấy mô hình có sẵn!' });
    return { glbUrl: cached.glbUrl, fromCache: true };
  }

  onProgress?.({ stage: 'generating-image', message: 'Đang tạo hình ảnh tham khảo...' });
  const meshyPrompt = `Multi-view orthographic reference sheet. ${imagePrompt} Show: large isometric 3/4 hero shot, FRONT VIEW, SIDE VIEW, BACK VIEW, TOP VIEW. Dark grey background. Labeled views. Stylized cartoon game asset, bright vivid colors, clean low-poly aesthetic. Professional game asset turnaround reference sheet.`;
  const materialIds = selectedItems.map((i) => i.materialId);
  const imageBuffer = await generateImageBuffer(meshyPrompt, materialIds);
  console.log(`[Pipeline] Leonardo image generated: ${imageBuffer.length} bytes`);

  onProgress?.({ stage: 'generating-3d', message: 'Đang tạo mô hình 3D... (2-5 phút)' });
  const taskId = await createImageTo3DTask(imageBuffer);
  console.log(`[Pipeline] Meshy task created: ${taskId}`);
  const glbDownloadUrl = await pollMeshyTask(taskId);
  console.log(`[Pipeline] Meshy GLB ready: ${glbDownloadUrl.slice(0, 80)}...`);

  // Upload reference image to Supabase
  const refImagePath = `generated/${hash}-ref.png`;
  await supabase.storage
    .from('models')
    .upload(refImagePath, imageBuffer, { contentType: 'image/png', upsert: true })
    .catch(() => {});
  const { data: refImageUrlData } = supabase.storage.from('models').getPublicUrl(refImagePath);

  onProgress?.({ stage: 'uploading', message: 'Đang lưu mô hình...' });
  const glbBuffer = await downloadGlb(glbDownloadUrl);
  const storagePath = `generated/${hash}.glb`;

  const { error: uploadError } = await supabase.storage
    .from('models')
    .upload(storagePath, glbBuffer, {
      contentType: 'model/gltf-binary',
      upsert: true,
    });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { error: insertError } = await supabase
    .from('generated_models')
    .insert({
      material_combo_hash: hash,
      materials: selectedItems.map((i) => ({ materialId: i.materialId, quantity: i.quantity })),
      craft_name: craftName,
      craft_description: craftDescription,
      glb_storage_path: storagePath,
      meshy_task_id: taskId,
    });

  if (insertError) {
    console.error('DB insert error (model still uploaded):', insertError);
  }

  const { data: urlData } = supabase.storage
    .from('models')
    .getPublicUrl(storagePath);

  onProgress?.({ stage: 'done', message: 'Mô hình 3D hoàn tất!' });
  return { glbUrl: urlData.publicUrl, referenceImageUrl: refImageUrlData?.publicUrl, fromCache: false };
}
