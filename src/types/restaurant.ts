// 数据模型对应启动文档「三、数据模型」，与 restaurants.json 字段一一对应。
export type Source = 'yifan_s1' | 'yifan_s2' | 'wulala' | 'liuyuxin';
export type Sentiment = '推荐' | '中性' | '差评';
export type Status = '营业' | '搬迁' | '关闭' | '存疑';

export interface Restaurant {
  id: string;
  name: string;
  city: string;
  district?: string;
  address: string;
  /** GCJ-02 坐标系，未核实时为 null */
  lat: number | null;
  lng: number | null;
  source: Source;
  source_detail?: string;
  video_url?: string;
  chef?: string;
  awards?: string[];
  cuisine?: string;
  signature_dishes?: string[];
  price_per_person?: number | null;
  sentiment?: Sentiment;
  status: Status;
  verified_at: string;
  notes?: string;
  dianping_shop_id?: string;
}

export const SOURCE_LABEL: Record<Source, string> = {
  yifan_s1: '一饭封神 S1',
  yifan_s2: '一饭封神 S2',
  wulala: '特别乌啦啦',
  liuyuxin: '刘雨鑫',
};
