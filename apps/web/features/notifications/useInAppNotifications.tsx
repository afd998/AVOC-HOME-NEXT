import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationUtil,
  createNotification as createNotificationUtil,
  type Notification 
} from '../../utils/notificationUtils';

export const useInAppNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => getNotifications(user?.id || ''),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Memoize unread count to prevent infinite loops
  const currentUnreadCount = useMemo(() => {
    return notifications.filter(n => !n.read_at).length;
  }, [notifications.map(n => `${n.id}-${n.read_at}`).join('|')]);

  // Only update state when memoized count changes
  useEffect(() => {
    setUnreadCount(currentUnreadCount);
  }, [currentUnreadCount]);

  // React Query mutations for notification actions
  const invalidate = () => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
    }
  };

  const createMyNotificationMutation = useMutation({
    mutationFn: async (args: { title: string; message: string; type: string; eventId?: number; data?: any }) => {
      if (!user?.id) throw new Error('No user');
      return createNotificationUtil(
        user.id,
        args.title,
        args.message,
        args.type,
        args.eventId,
        args.data
      );
    },
    onSuccess: invalidate,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: invalidate,
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user');
      return markAllNotificationsAsRead(user.id);
    },
    onSuccess: invalidate,
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => deleteNotificationUtil(notificationId),
    onSuccess: invalidate,
  });

  // Convenience wrappers
  const createNotification = (args: { title: string; message: string; type: string; eventId?: number; data?: any }) =>
    createMyNotificationMutation.mutateAsync(args);

  const markAsRead = (notificationId: string) => markAsReadMutation.mutateAsync(notificationId);

  const markAllAsRead = () => markAllAsReadMutation.mutateAsync();

  const deleteNotification = (notificationId: string) => deleteNotificationMutation.mutateAsync(notificationId);

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    // actions
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,

    // optional mutation state flags
    creating: createMyNotificationMutation.isPending,
    markingAsRead: markAsReadMutation.isPending,
    markingAllAsRead: markAllAsReadMutation.isPending,
    deleting: deleteNotificationMutation.isPending,
  };
}; 