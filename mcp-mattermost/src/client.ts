// ============================================================================
// MCP Mattermost - API Client
// ============================================================================

import type {
  User, Team, TeamMember, Channel, ChannelMember,
  Post, PostList, Reaction,
  IncomingWebhook, OutgoingWebhook,
  Playbook, PropertyField, PropertyValue,
  Run, ChecklistItem
} from './types/index.js';

export class MattermostClient {
  private baseUrl: string;
  private token: string;
  private playbooksUrl: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
    this.playbooksUrl = `${this.baseUrl}/plugins/playbooks/api/v0`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isPlaybooks = false
  ): Promise<T> {
    const url = isPlaybooks
      ? `${this.playbooksUrl}${endpoint}`
      : `${this.baseUrl}/api/v4${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mattermost API error: ${response.status} - ${error}`);
    }

    // Handle empty responses (204 No Content or empty body)
    if (response.status === 204) {
      return { status: 'ok' } as T;
    }

    // Try to parse JSON, return status ok if empty
    const text = await response.text();
    if (!text || text.trim() === '') {
      return { status: 'ok' } as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      // If JSON parse fails but response was successful, return ok
      return { status: 'ok' } as T;
    }
  }

  // ==========================================================================
  // USER
  // ==========================================================================

  async userGet(userId: string): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  async userGetByUsername(username: string): Promise<User> {
    return this.request<User>(`/users/username/${username}`);
  }

  async userSearch(term: string, teamId?: string): Promise<User[]> {
    return this.request<User[]>('/users/search', {
      method: 'POST',
      body: JSON.stringify({ term, team_id: teamId }),
    });
  }

  async userCreate(user: Partial<User>): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async userUpdate(userId: string, user: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${userId}/patch`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async userUpdateProps(userId: string, props: Record<string, any>): Promise<User> {
    return this.request<User>(`/users/${userId}/patch`, {
      method: 'PUT',
      body: JSON.stringify({ props }),
    });
  }

  // ==========================================================================
  // WEBHOOK
  // ==========================================================================

  async webhookOutgoingCreate(webhook: Partial<OutgoingWebhook>): Promise<OutgoingWebhook> {
    return this.request<OutgoingWebhook>('/hooks/outgoing', {
      method: 'POST',
      body: JSON.stringify(webhook),
    });
  }

  async webhookOutgoingList(teamId: string): Promise<OutgoingWebhook[]> {
    return this.request<OutgoingWebhook[]>(`/hooks/outgoing?team_id=${teamId}`);
  }

  async webhookOutgoingGet(hookId: string): Promise<OutgoingWebhook> {
    return this.request<OutgoingWebhook>(`/hooks/outgoing/${hookId}`);
  }

  async webhookOutgoingUpdate(hookId: string, webhook: Partial<OutgoingWebhook>): Promise<OutgoingWebhook> {
    return this.request<OutgoingWebhook>(`/hooks/outgoing/${hookId}`, {
      method: 'PUT',
      body: JSON.stringify(webhook),
    });
  }

  async webhookOutgoingDelete(hookId: string): Promise<{ status: string }> {
    return this.request(`/hooks/outgoing/${hookId}`, { method: 'DELETE' });
  }

  async webhookIncomingCreate(webhook: Partial<IncomingWebhook>): Promise<IncomingWebhook> {
    return this.request<IncomingWebhook>('/hooks/incoming', {
      method: 'POST',
      body: JSON.stringify(webhook),
    });
  }

  async webhookIncomingList(teamId: string): Promise<IncomingWebhook[]> {
    return this.request<IncomingWebhook[]>(`/hooks/incoming?team_id=${teamId}`);
  }

  async webhookIncomingGet(hookId: string): Promise<IncomingWebhook> {
    return this.request<IncomingWebhook>(`/hooks/incoming/${hookId}`);
  }

  async webhookIncomingUpdate(hookId: string, webhook: Partial<IncomingWebhook>): Promise<IncomingWebhook> {
    return this.request<IncomingWebhook>(`/hooks/incoming/${hookId}`, {
      method: 'PUT',
      body: JSON.stringify(webhook),
    });
  }

  async webhookIncomingDelete(hookId: string): Promise<{ status: string }> {
    return this.request(`/hooks/incoming/${hookId}`, { method: 'DELETE' });
  }

  // ==========================================================================
  // TEAM
  // ==========================================================================

  async teamGet(teamId: string): Promise<Team> {
    return this.request<Team>(`/teams/${teamId}`);
  }

  async teamGetByName(name: string): Promise<Team> {
    return this.request<Team>(`/teams/name/${name}`);
  }

  async teamList(): Promise<Team[]> {
    return this.request<Team[]>('/teams');
  }

  /**
   * Update team props using full update (GET + merge + PUT).
   * The PATCH endpoint ignores `props` field, so we need to use full PUT.
   */
  async teamUpdateProps(teamId: string, props: Record<string, any>): Promise<Team> {
    // Get current team state
    const team = await this.teamGet(teamId);
    
    // Merge props
    const mergedProps = { ...(team.props ?? {}), ...props };
    
    // Full update with merged props
    return this.request<Team>(`/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...team,
        props: mergedProps,
      }),
    });
  }

  async teamGetMembers(teamId: string): Promise<TeamMember[]> {
    return this.request<TeamMember[]>(`/teams/${teamId}/members`);
  }

  async teamAddMember(teamId: string, userId: string): Promise<TeamMember> {
    return this.request<TeamMember>(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ team_id: teamId, user_id: userId }),
    });
  }

  async teamRemoveMember(teamId: string, userId: string): Promise<{ status: string }> {
    return this.request(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
  }

  // ==========================================================================
  // CHANNEL
  // ==========================================================================

  async channelGet(channelId: string): Promise<Channel> {
    return this.request<Channel>(`/channels/${channelId}`);
  }

  async channelGetByName(teamId: string, name: string): Promise<Channel> {
    return this.request<Channel>(`/teams/${teamId}/channels/name/${name}`);
  }

  async channelList(teamId: string): Promise<Channel[]> {
    return this.request<Channel[]>(`/teams/${teamId}/channels`);
  }

  async channelSearch(teamId: string, term: string): Promise<Channel[]> {
    return this.request<Channel[]>('/channels/search', {
      method: 'POST',
      body: JSON.stringify({ team_id: teamId, term }),
    });
  }

  async channelCreate(channel: Partial<Channel>): Promise<Channel> {
    return this.request<Channel>('/channels', {
      method: 'POST',
      body: JSON.stringify(channel),
    });
  }

  async channelUpdate(channelId: string, channel: Partial<Channel>): Promise<Channel> {
    return this.request<Channel>(`/channels/${channelId}/patch`, {
      method: 'PUT',
      body: JSON.stringify(channel),
    });
  }

  /**
   * Update channel props using full update (GET + merge + PUT).
   * The PATCH endpoint ignores `props` field, so we need to use full PUT.
   */
  async channelUpdateProps(channelId: string, props: Record<string, any>): Promise<Channel> {
    // Get current channel state
    const channel = await this.channelGet(channelId);
    
    // Merge props
    const mergedProps = { ...(channel.props ?? {}), ...props };
    
    // Full update with merged props
    return this.request<Channel>(`/channels/${channelId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...channel,
        props: mergedProps,
      }),
    });
  }

  async channelDelete(channelId: string): Promise<{ status: string }> {
    return this.request(`/channels/${channelId}`, { method: 'DELETE' });
  }

  async channelGetMembers(channelId: string): Promise<ChannelMember[]> {
    return this.request<ChannelMember[]>(`/channels/${channelId}/members`);
  }

  async channelAddMember(channelId: string, userId: string): Promise<ChannelMember> {
    return this.request<ChannelMember>(`/channels/${channelId}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async channelRemoveMember(channelId: string, userId: string): Promise<{ status: string }> {
    return this.request(`/channels/${channelId}/members/${userId}`, { method: 'DELETE' });
  }

  // ==========================================================================
  // POST
  // ==========================================================================

  async postGet(postId: string): Promise<Post> {
    return this.request<Post>(`/posts/${postId}`);
  }

  async postGetChannel(channelId: string, page = 0, perPage = 60): Promise<PostList> {
    return this.request<PostList>(`/channels/${channelId}/posts?page=${page}&per_page=${perPage}`);
  }

  async postGetThread(postId: string): Promise<PostList> {
    return this.request<PostList>(`/posts/${postId}/thread`);
  }

  async postSearch(teamId: string, terms: string): Promise<PostList> {
    return this.request<PostList>(`/teams/${teamId}/posts/search`, {
      method: 'POST',
      body: JSON.stringify({ terms, is_or_search: false }),
    });
  }

  async postCreate(post: Partial<Post>): Promise<Post> {
    return this.request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  }

  async postUpdate(postId: string, message: string): Promise<Post> {
    return this.request<Post>(`/posts/${postId}/patch`, {
      method: 'PUT',
      body: JSON.stringify({ message }),
    });
  }

  async postUpdateProps(postId: string, props: Record<string, any>): Promise<Post> {
    return this.request<Post>(`/posts/${postId}/patch`, {
      method: 'PUT',
      body: JSON.stringify({ props }),
    });
  }

  async postDelete(postId: string): Promise<{ status: string }> {
    return this.request(`/posts/${postId}`, { method: 'DELETE' });
  }

  async postPin(postId: string): Promise<{ status: string }> {
    return this.request(`/posts/${postId}/pin`, { method: 'POST' });
  }

  async postUnpin(postId: string): Promise<{ status: string }> {
    return this.request(`/posts/${postId}/unpin`, { method: 'POST' });
  }

  async postGetPinned(channelId: string): Promise<PostList> {
    return this.request<PostList>(`/channels/${channelId}/pinned`);
  }

  async reactionAdd(userId: string, postId: string, emojiName: string): Promise<Reaction> {
    return this.request<Reaction>('/reactions', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, post_id: postId, emoji_name: emojiName }),
    });
  }

  async reactionRemove(userId: string, postId: string, emojiName: string): Promise<{ status: string }> {
    return this.request(`/users/${userId}/posts/${postId}/reactions/${emojiName}`, { method: 'DELETE' });
  }

  async reactionGet(postId: string): Promise<Reaction[]> {
    return this.request<Reaction[]>(`/posts/${postId}/reactions`);
  }

  // ==========================================================================
  // PLAYBOOK
  // ==========================================================================

  async playbookGet(playbookId: string): Promise<Playbook> {
    return this.request<Playbook>(`/playbooks/${playbookId}`, {}, true);
  }

  async playbookList(teamId: string): Promise<{ items: Playbook[] }> {
    return this.request(`/playbooks?team_id=${teamId}`, {}, true);
  }

  async playbookCreate(playbook: Partial<Playbook>): Promise<{ id: string }> {
    return this.request('/playbooks', {
      method: 'POST',
      body: JSON.stringify(playbook),
    }, true);
  }

  /**
   * Update playbook using full update (GET + merge + PUT).
   * The Playbooks API requires all fields to be sent on PUT.
   */
  async playbookUpdate(playbookId: string, updates: Partial<Playbook>): Promise<{ status: string }> {
    // Get current playbook state
    const playbook = await this.playbookGet(playbookId);
    
    // Merge updates into current state
    const merged = { ...playbook, ...updates };
    
    // Full update with merged data
    return this.request(`/playbooks/${playbookId}`, {
      method: 'PUT',
      body: JSON.stringify(merged),
    }, true);
  }

  async playbookDelete(playbookId: string): Promise<{ status: string }> {
    return this.request(`/playbooks/${playbookId}`, { method: 'DELETE' }, true);
  }

  async playbookFieldList(playbookId: string): Promise<PropertyField[]> {
    return this.request<PropertyField[]>(`/playbooks/${playbookId}/property_fields`, {}, true);
  }

  async playbookFieldCreate(playbookId: string, field: Partial<PropertyField>): Promise<PropertyField> {
    return this.request<PropertyField>(`/playbooks/${playbookId}/property_fields`, {
      method: 'POST',
      body: JSON.stringify(field),
    }, true);
  }

  async playbookFieldUpdate(playbookId: string, fieldId: string, field: Partial<PropertyField>): Promise<PropertyField> {
    return this.request<PropertyField>(`/playbooks/${playbookId}/property_fields/${fieldId}`, {
      method: 'PUT',
      body: JSON.stringify(field),
    }, true);
  }

  async playbookFieldDelete(playbookId: string, fieldId: string): Promise<{ status: string }> {
    return this.request(`/playbooks/${playbookId}/property_fields/${fieldId}`, { method: 'DELETE' }, true);
  }

  // ==========================================================================
  // RUN
  // ==========================================================================

  async runGet(runId: string): Promise<Run> {
    return this.request<Run>(`/runs/${runId}`, {}, true);
  }

  async runGetByChannel(channelId: string): Promise<Run> {
    return this.request<Run>(`/runs/channel/${channelId}`, {}, true);
  }

  async runList(teamId: string, params: { statuses?: string[], owner_user_id?: string } = {}): Promise<{ items: Run[] }> {
    const query = new URLSearchParams({ team_id: teamId });
    if (params.statuses) params.statuses.forEach(s => query.append('statuses', s));
    if (params.owner_user_id) query.set('owner_user_id', params.owner_user_id);
    return this.request(`/runs?${query}`, {}, true);
  }

  async runStart(run: {
    name: string;
    playbook_id: string;
    owner_user_id: string;
    team_id: string;
    channel_id?: string;
    description?: string;
  }): Promise<Run> {
    return this.request<Run>('/runs', {
      method: 'POST',
      body: JSON.stringify(run),
    }, true);
  }

  async runUpdate(runId: string, run: Partial<Run>): Promise<{ status: string }> {
    return this.request(`/runs/${runId}`, {
      method: 'PATCH',
      body: JSON.stringify(run),
    }, true);
  }

  async runFinish(runId: string): Promise<{ status: string }> {
    return this.request(`/runs/${runId}/finish`, { method: 'PUT' }, true);
  }

  async runEnd(runId: string): Promise<{ status: string }> {
    return this.request(`/runs/${runId}/end`, { method: 'PUT' }, true);
  }

  async runRestart(runId: string): Promise<{ status: string }> {
    return this.request(`/runs/${runId}/restart`, { method: 'PUT' }, true);
  }

  async runStatusUpdate(runId: string, message: string, reminder?: number): Promise<{ status: string }> {
    return this.request(`/runs/${runId}/status`, {
      method: 'POST',
      body: JSON.stringify({ message, reminder }),
    }, true);
  }

  async runChangeOwner(runId: string, ownerId: string): Promise<{ status: string }> {
    return this.request(`/runs/${runId}/owner`, {
      method: 'POST',
      body: JSON.stringify({ owner_id: ownerId }),
    }, true);
  }

  async runPropertyList(runId: string): Promise<{ fields: PropertyField[], values: PropertyValue[] }> {
    const [fields, values] = await Promise.all([
      this.request<PropertyField[]>(`/runs/${runId}/property_fields`, {}, true),
      this.request<PropertyValue[]>(`/runs/${runId}/property_values`, {}, true),
    ]);
    return { fields, values };
  }

  async runPropertyGet(runId: string, fieldId: string): Promise<PropertyValue | null> {
    const { values } = await this.runPropertyList(runId);
    return values.find(v => v.field_id === fieldId) || null;
  }

  async runPropertySet(runId: string, fieldId: string, value: string): Promise<PropertyValue> {
    return this.request<PropertyValue>(`/runs/${runId}/property_fields/${fieldId}/value`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }, true);
  }

  // ==========================================================================
  // TASK
  // ==========================================================================

  async taskGet(runId: string, checklistIndex: number, itemIndex: number): Promise<ChecklistItem | null> {
    const run = await this.runGet(runId);
    const checklist = run.checklists[checklistIndex];
    if (!checklist) return null;
    return checklist.items[itemIndex] || null;
  }

  async taskAdd(runId: string, checklistIndex: number, task: Partial<ChecklistItem>): Promise<{ status: string }> {
    return this.request(`/runs/${runId}/checklists/${checklistIndex}/add`, {
      method: 'POST',
      body: JSON.stringify(task),
    }, true);
  }

  async taskUpdate(runId: string, checklistIndex: number, itemIndex: number, task: { title?: string; command?: string }): Promise<{ status: string }> {
    return this.request(`/runs/${runId}/checklists/${checklistIndex}/item/${itemIndex}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    }, true);
  }

  async taskUpdateDescription(runId: string, checklistIndex: number, itemIndex: number, description: string): Promise<{ status: string }> {
    return this.request(`/runs/${runId}/checklists/${checklistIndex}/item/${itemIndex}/description`, {
      method: 'PUT',
      body: JSON.stringify({ description }),
    }, true);
  }

  async taskDelete(runId: string, checklistIndex: number, itemIndex: number): Promise<{ status: string }> {
    return this.request(`/runs/${runId}/checklists/${checklistIndex}/item/${itemIndex}`, { method: 'DELETE' }, true);
  }

  async taskSetState(runId: string, checklistIndex: number, itemIndex: number, state: '' | 'in_progress' | 'closed'): Promise<{ status: string }> {
    return this.request(`/runs/${runId}/checklists/${checklistIndex}/item/${itemIndex}/state`, {
      method: 'PUT',
      body: JSON.stringify({ new_state: state }),
    }, true);
  }

  async taskCheck(runId: string, checklistIndex: number, itemIndex: number): Promise<{ status: string }> {
    return this.taskSetState(runId, checklistIndex, itemIndex, 'closed');
  }

  async taskUncheck(runId: string, checklistIndex: number, itemIndex: number): Promise<{ status: string }> {
    return this.taskSetState(runId, checklistIndex, itemIndex, '');
  }

  async taskSetAssignee(runId: string, checklistIndex: number, itemIndex: number, assigneeId: string): Promise<{ status: string }> {
    return this.request(`/runs/${runId}/checklists/${checklistIndex}/item/${itemIndex}/assignee`, {
      method: 'PUT',
      body: JSON.stringify({ assignee_id: assigneeId }),
    }, true);
  }

  async taskRunCommand(runId: string, checklistIndex: number, itemIndex: number): Promise<{ trigger_id: string }> {
    return this.request(`/runs/${runId}/checklists/${checklistIndex}/item/${itemIndex}/run`, {
      method: 'PUT',
    }, true);
  }

  async taskReorder(runId: string, checklistIndex: number, itemIndex: number, newIndex: number): Promise<{ status: string }> {
    return this.request(`/runs/${runId}/checklists/${checklistIndex}/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ item_num: itemIndex, new_location: newIndex }),
    }, true);
  }

  async taskCheckChecklist(runId: string, checklistIndex: number): Promise<{ checked_count: number }> {
    const run = await this.runGet(runId);
    const checklist = run.checklists[checklistIndex];
    if (!checklist) throw new Error('Checklist not found');

    let count = 0;
    for (let i = 0; i < checklist.items.length; i++) {
      if (checklist.items[i].state !== 'closed') {
        await this.taskCheck(runId, checklistIndex, i);
        count++;
      }
    }
    return { checked_count: count };
  }
}
