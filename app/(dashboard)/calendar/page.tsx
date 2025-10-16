
import { redirect } from 'next/navigation';

export default function CalendarPage() {
  // Get today's date in YYYY-MM-D format
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  redirect(`/calendar/${dateString}`);
}