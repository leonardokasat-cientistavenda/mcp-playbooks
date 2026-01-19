// ============================================================================
// MCP Mattermost - Types
// ============================================================================

// ----------------------------------------------------------------------------
// User
// ----------------------------------------------------------------------------

export interface User {
  id: string;
  username: string;
  email: string;
  nickname?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  roles: string;
  props: Record<string, any>;
  notify_props?: Record<string, any>;
  create_at: number;
  update_at: number;
  delete_at: number;
}

// ----------------------------------------------------------------------------
// Team
// ----------------------------------------------------------------------------

export interface Team {
  id: string;
  name: string;
  display_name: string;
  description: string;
  type: 'O' | 'I';
  props: Record<string, any>;
  create_at: number;
  update_at: number;
  delete_at: number;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  roles: string;
  scheme_admin: boolean;
  scheme_user: boolean;
}

// ----------------------------------------------------------------------------
// Channel
// ----------------------------------------------------------------------------

export interface Channel {
  id: string;
  team_id: string;
  name: string;
  display_name: string;
  type: 'O' | 'P' | 'D' | 'G';
  header: string;
  purpose: string;
  props: Record<string, any>;
  creator_id: string;
  create_at: number;
  update_at: number;
  delete_at: number;
}

export interface ChannelMember {
  channel_id: string;
  user_id: string;
  roles: string;
  scheme_admin: boolean;
  scheme_user: boolean;
}

// ----------------------------------------------------------------------------
// Post
// ----------------------------------------------------------------------------

export interface Post {
  id: string;
  channel_id: string;
  user_id: string;
  root_id: string;
  message: string;
  type: string;
  props: Record<string, any>;
  file_ids: string[];
  pending_post_id: string;
  metadata?: PostMetadata;
  create_at: number;
  update_at: number;
  edit_at: number;
  delete_at: number;
}

export interface PostMetadata {
  reactions?: Reaction[];
  embeds?: any[];
  files?: any[];
}

export interface Reaction {
  user_id: string;
  post_id: string;
  emoji_name: string;
  create_at: number;
}

export interface PostList {
  order: string[];
  posts: Record<string, Post>;
  next_post_id?: string;
  prev_post_id?: string;
}

// ----------------------------------------------------------------------------
// Webhook
// ----------------------------------------------------------------------------

export interface IncomingWebhook {
  id: string;
  channel_id: string;
  team_id: string;
  display_name: string;
  description: string;
  username?: string;
  icon_url?: string;
  create_at: number;
  update_at: number;
  delete_at: number;
}

export interface OutgoingWebhook {
  id: string;
  team_id: string;
  channel_id: string;
  creator_id: string;
  display_name: string;
  description: string;
  trigger_words: string[];
  trigger_when: 0 | 1;
  callback_urls: string[];
  content_type: string;
  token: string;
  create_at: number;
  update_at: number;
  delete_at: number;
}

// ----------------------------------------------------------------------------
// Playbook
// ----------------------------------------------------------------------------

export interface Playbook {
  id: string;
  title: string;
  description: string;
  team_id: string;
  public: boolean;
  create_public_playbook_run: boolean;
  message_on_join: string;
  message_on_join_enabled: boolean;
  run_summary_template: string;
  run_summary_template_enabled: boolean;
  channel_name_template: string;
  retrospective_template: string;
  retrospective_enabled: boolean;
  reminder_message_template: string;
  reminder_timer_default_seconds: number;
  webhook_on_creation_urls: string[];
  webhook_on_creation_enabled: boolean;
  webhook_on_status_update_urls: string[];
  webhook_on_status_update_enabled: boolean;
  channel_mode: 'create_new_channel' | 'link_existing_channel';
  channel_id: string;
  checklists: Checklist[];
  member_ids: string[];
  invited_user_ids: string[];
  invited_group_ids: string[];
  create_at: number;
  update_at: number;
  delete_at: number;
}

export interface PropertyField {
  id: string;
  name: string;
  type: 'text' | 'select' | 'multiselect';
  description?: string;
  attrs?: Record<string, any>;
  create_at: number;
  update_at: number;
  delete_at: number;
}

export interface PropertyValue {
  id: string;
  field_id: string;
  value: string;
  create_at: number;
  update_at: number;
  delete_at: number;
}

// ----------------------------------------------------------------------------
// Run
// ----------------------------------------------------------------------------

export interface Run {
  id: string;
  name: string;
  description: string;
  team_id: string;
  channel_id: string;
  playbook_id: string;
  owner_user_id: string;
  current_status: 'InProgress' | 'Finished';
  checklists: Checklist[];
  create_at: number;
  end_at: number;
  delete_at: number;
}

// ----------------------------------------------------------------------------
// Checklist & Task
// ----------------------------------------------------------------------------

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  items_order: string[];
  update_at: number;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  state: '' | 'in_progress' | 'closed';
  state_modified: number;
  assignee_id: string;
  assignee_modified: number;
  command: string;
  command_last_run: number;
  due_date: number;
  task_actions: TaskAction[];
  update_at: number;
}

export interface TaskAction {
  trigger: {
    type: 'on_state_change' | 'on_run_start' | 'on_status_update';
  };
  actions: TaskActionItem[];
}

export interface TaskActionItem {
  type: 'webhook' | 'broadcast';
  url?: string;
  channel_id?: string;
}

// ----------------------------------------------------------------------------
// API Responses
// ----------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  items: T[];
  total_count: number;
  page_count: number;
  has_more: boolean;
}

export interface StatusResponse {
  status: 'ok' | 'error';
  message?: string;
}
