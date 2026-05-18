"use client";

import { Bell, Music, Users, Gift, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

type Notification = {
  id: string;
  type: "track" | "user" | "reward" | "system" | "success";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
};

export function NotificationsClient() {
  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      type: "track",
      title: "New Track Generated",
      message: "Your 'Summer Vibes' track is ready to download",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      read: false,
    },
    {
      id: "2",
      type: "reward",
      title: "Gold Bonus Received",
      message: "You earned 100 Gold for completing your first track",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
    },
    {
      id: "3",
      type: "success",
      title: "Profile Updated",
      message: "Your profile has been successfully updated",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
    },
    {
      id: "4",
      type: "system",
      title: "System Maintenance",
      message: "Scheduled maintenance completed successfully",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      read: true,
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "track":
        return <Music className="w-5 h-5 text-blue-400" />;
      case "user":
        return <Users className="w-5 h-5 text-purple-400" />;
      case "reward":
        return <Gift className="w-5 h-5 text-yellow-400" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "system":
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      default:
        return <Bell className="w-5 h-5 text-white/60" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#0D0D1A]">
      {/* Header */}
      <div className="border-b border-[#1E1E3A] px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-sm text-white/60 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          <Bell className="w-8 h-8 text-[#7C3AED]" />
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/60">
            <div className="text-center">
              <Bell className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p>No notifications yet</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#1E1E3A]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-8 py-4 hover:bg-white/2 transition-colors cursor-pointer border-l-4 ${
                  notification.read ? "border-transparent" : "border-[#7C3AED]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-white">
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 inline-flex w-2 h-2 rounded-full bg-[#7C3AED]" />
                          )}
                        </p>
                        <p className="text-sm text-white/70 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-white/50 mt-2">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
