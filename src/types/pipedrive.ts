
export interface Deal {
  id: number;
  title: string;
  customer_name: string;
  salesperson_name: string;
  salesperson_id: number;
  salesperson_avatar?: string;
  value: number;
  currency: string;
  add_time: string;
  status: string;
  stage_id: number;
  stage_name: string;
  pipeline_id?: number;
  completed_at?: string;
  completed_by?: string;
}

export interface ApiResponse {
  success: boolean;
  data: Deal[];
  error?: string;
}

export interface WebhookEvent {
  event: string;
  meta?: {
    action: string;
    id: string;
    object: string;
  };
  data?: {
    id: number;
    title: string;
    value: number;
    stage_id: number;
    pipeline_id: number;
    [key: string]: any;
  };
  timestamp: string;
  user?: string;
}

export interface WebhookConfig {
  id: string;
  url: string;
  event_action: string;
  event_object: string;
  active: boolean;
  target_pipeline_id: number;
  target_stage_id: number;
}

export interface WebhookResponse {
  status: string;
  message: string;
}
