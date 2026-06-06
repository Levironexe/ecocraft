import { Material } from './types';

export const materials: Material[] = [
  { id: 'chai-nhua', name: 'Chai nhựa', emoji: '🧴', modelPath: '/models/chai-nhua.glb', sizeOptions: ['Lớn (1.5L)', 'Vừa (500ml)', 'Nhỏ (330ml)'], category: 'plastic' },
  { id: 'ong-hut', name: 'Ống hút', emoji: '🥤', modelPath: '/models/ong-hut.glb', sizeOptions: ['Nhựa thường', 'Giấy', 'Inox'], category: 'plastic' },
  { id: 'giay-bao', name: 'Giấy báo', emoji: '📰', modelPath: '/models/giay-bao.glb', sizeOptions: ['Tờ lớn', 'Tờ nhỏ'], category: 'paper' },
  { id: 'lon-nuoc', name: 'Lon nước', emoji: '🥫', modelPath: '/models/lon-nuoc.glb', sizeOptions: ['330ml', '250ml'], category: 'metal' },
  { id: 'nap-chai', name: 'Nắp chai', emoji: '🧢', modelPath: '/models/nap-chai.glb', sizeOptions: ['Nắp nhựa', 'Nắp kim loại'], category: 'plastic' },
  { id: 'thung-carton', name: 'Thùng carton', emoji: '📦', modelPath: '/models/thung-carton.glb', sizeOptions: ['Lớn', 'Vừa', 'Nhỏ'], category: 'paper' },
  { id: 'loi-giay', name: 'Lõi giấy', emoji: '🧻', modelPath: '/models/loi-giay.glb', sizeOptions: ['Lõi giấy vệ sinh', 'Lõi giấy bếp'], category: 'paper' },
  { id: 'vai-vun', name: 'Vải vụn', emoji: '👕', modelPath: '/models/vai-vun.glb', sizeOptions: ['Vải cotton', 'Vải tổng hợp'], category: 'fabric' },
  { id: 'dua-go', name: 'Đũa gỗ', emoji: '🥢', modelPath: '/models/dua-go.glb', sizeOptions: ['Đũa dài', 'Đũa ngắn'], category: 'wood' },
  { id: 'chai-thuy-tinh', name: 'Chai thủy tinh', emoji: '🍶', modelPath: '/models/chai-thuy-tinh.glb', sizeOptions: ['Lớn', 'Nhỏ'], category: 'glass' },
  { id: 'day-ruy-bang', name: 'Dây ruy băng', emoji: '🎀', modelPath: '/models/day-ruy-bang.glb', sizeOptions: ['Rộng', 'Hẹp'], category: 'fabric' },
  { id: 'vo-trung', name: 'Vỏ trứng', emoji: '🥚', modelPath: '/models/vo-trung.glb', sizeOptions: ['Trứng gà', 'Trứng vịt'], category: 'other' },
];
