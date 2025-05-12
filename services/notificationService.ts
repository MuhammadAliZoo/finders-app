import { supabase } from '../config/supabase';

export type NotificationType = 
  | 'claim_status_changed'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'item_claimed';

interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  itemId?: string;
  claimId?: string;
  disputeId?: string;
  recipientId: string;
}

export const notificationService = {
  async sendNotification(data: NotificationData) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          type: data.type,
          title: data.title,
          message: data.message,
          item_id: data.itemId,
          claim_id: data.claimId,
          dispute_id: data.disputeId,
          recipient_id: data.recipientId,
          read: false,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  },

  // Notify when claim status changes
  async notifyClaimStatusChange(claimId: string, status: string, itemTitle: string, recipientId: string) {
    const title = 'Claim Status Updated';
    const message = `Your claim for "${itemTitle}" has been ${status.toLowerCase()}`;
    
    return this.sendNotification({
      type: 'claim_status_changed',
      title,
      message,
      claimId,
      recipientId,
    });
  },

  // Notify when a dispute is opened
  async notifyDisputeOpened(disputeId: string, itemTitle: string, recipientId: string) {
    const title = 'New Dispute Opened';
    const message = `A dispute has been opened for "${itemTitle}"`;
    
    return this.sendNotification({
      type: 'dispute_opened',
      title,
      message,
      disputeId,
      recipientId,
    });
  },

  // Notify when a dispute is resolved
  async notifyDisputeResolved(disputeId: string, itemTitle: string, resolution: string, recipientId: string) {
    const title = 'Dispute Resolved';
    const message = `The dispute for "${itemTitle}" has been resolved: ${resolution}`;
    
    return this.sendNotification({
      type: 'dispute_resolved',
      title,
      message,
      disputeId,
      recipientId,
    });
  },

  // Notify when an item is claimed
  async notifyItemClaimed(itemId: string, itemTitle: string, recipientId: string) {
    const title = 'Item Claimed';
    const message = `Your item "${itemTitle}" has been claimed`;
    
    return this.sendNotification({
      type: 'item_claimed',
      title,
      message,
      itemId,
      recipientId,
    });
  },
}; 