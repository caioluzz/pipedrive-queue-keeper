export interface Deal {
  id: number;
  title: string;
  customer_name: string;
  salesperson_name: string;
  salesperson_id: number;
  value: number;
  currency: string;
  add_time: string;
  status: string;
  stage_id: number;
  stage_name: string;
  pipeline_id: number;
  completed_at?: string;
  completed_by?: string;
}

export interface ApiResponse {
  success: boolean;
  data: any;
  error?: string;
}

export interface WebhookEvent {
  event: string;
  data: {
    id: number;
    title: string;
    value: number;
    stage_id: number;
    pipeline_id: number;
  };
  timestamp: string;
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
  status: 'success' | 'error' | 'ignored';
  message: string;
}
