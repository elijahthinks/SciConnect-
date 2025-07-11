import { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import useNotificationStore from '../store/notifications';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotificationStore();

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Handle navigation or other actions based on notification type
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 relative"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Notifications</h3>
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 rounded-lg cursor-pointer ${
                      notification.read ? 'bg-gray-50' : 'bg-blue-50'
                    }`}
                  >
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">No notifications</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 