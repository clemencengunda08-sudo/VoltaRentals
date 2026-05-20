'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  ChevronRight, 
  ClipboardList,
  CreditCard,
  CheckCircle2,
  XCircle,
  Car,
  Flag,
  AlertCircle,
  Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { markAsRead, markAllAsRead } from '@/lib/notifications';
import { useFirestore } from '@/firebase';

interface NotificationListProps {
  notifications: any[] | null;
  userId: string;
}

/**
 * A specialized notification list for the Navbar popover.
 * Adheres to the premium navy-gold aesthetic of VoltaRentals.
 */
export default function NotificationList({ notifications, userId }: NotificationListProps) {
  const db = useFirestore();
  const router = useRouter();

  const handleAction = async (notif: any) => {
    if (!notif.read) await markAsRead(db, notif.id);
    if (notif.actionUrl) router.push(notif.actionUrl);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking_received': return <ClipboardList className="h-4 w-4 text-blue-500" />;
      case 'booking_confirmed': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'booking_cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'booking_active': return <Car className="h-4 w-4 text-primary" />;
      case 'booking_completed': return <Flag className="h-4 w-4 text-muted-foreground" />;
      case 'payment_received': return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'payment_verified': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'payment_rejected': return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default: return <Megaphone className="h-4 w-4 text-primary" />;
    }
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div className="flex flex-col h-[450px] bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="font-black uppercase text-[10px] tracking-widest text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); markAllAsRead(db, userId); }}
            className="h-7 px-2 text-[9px] font-black uppercase tracking-widest hover:bg-primary/5 text-primary"
          >
            Mark all read
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {!notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 space-y-3 opacity-20">
            <Bell className="h-12 w-12 text-muted-foreground" />
            <p className="text-[10px] font-black uppercase tracking-widest">No activity recorded</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleAction(notif)}
                className={cn(
                  "p-4 cursor-pointer transition-all group relative border-l-4",
                  !notif.read ? "bg-primary/5 border-l-primary hover:bg-primary/10" : "bg-transparent border-l-transparent hover:bg-muted/50"
                )}
              >
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center shadow-sm">
                      {getIcon(notif.type)}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={cn("text-xs font-bold leading-tight", !notif.read ? "text-primary" : "text-foreground/70")}>
                      {notif.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[8px] font-black uppercase text-muted-foreground/60 flex items-center gap-1">
                        {notif.createdAt?.toDate ? formatDistanceToNow(notif.createdAt.toDate()) : 'Recently'} ago
                      </span>
                      {notif.actionUrl && (
                        <ChevronRight className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-1" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t bg-muted/30 text-center">
        <Button variant="link" size="sm" asChild className="text-[9px] font-black uppercase tracking-widest h-auto p-0 text-muted-foreground hover:text-primary">
          <a href="/dashboard/notifications">View all protocol alerts</a>
        </Button>
      </div>
    </div>
  );
}
