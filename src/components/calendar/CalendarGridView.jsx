import { useState } from "react";
import InstagramPostPreviewModal from "@/components/common/InstagramPostPreviewModal";
import CalendarDesktopGrid from "./CalendarDesktopGrid";
import CalendarMobileView from "./CalendarMobileView";

// Helper to format time as HH:MM (ignoring seconds if present)
export function formatTimeHHMM(timeStr) {
  if (!timeStr) return "18:00";
  const parts = timeStr.toString().split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
}

export default function CalendarGridView({
  mes = new Date().getMonth() + 1,
  anio = new Date().getFullYear(),
  posts = [],
  readOnly = false,
  onDayClick,
  onPostClick
}) {
  const [selectedPost, setSelectedPost] = useState(null);

  // Post Navigation State (Instagram style navigation between posts)
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = `${a.fecha_programada || ''} ${a.hora_programada || ''}`;
    const dateB = `${b.fecha_programada || ''} ${b.hora_programada || ''}`;
    return dateA.localeCompare(dateB);
  });

  const currentPostIndex = selectedPost
    ? sortedPosts.findIndex((p) => p.id === selectedPost.id)
    : -1;
  const hasPrevPost = currentPostIndex > 0;
  const hasNextPost = currentPostIndex !== -1 && currentPostIndex < sortedPosts.length - 1;

  const goToPrevPost = (e) => {
    if (e) e.stopPropagation();
    if (hasPrevPost) {
      setSelectedPost(sortedPosts[currentPostIndex - 1]);
    }
  };

  const goToNextPost = (e) => {
    if (e) e.stopPropagation();
    if (hasNextPost) {
      setSelectedPost(sortedPosts[currentPostIndex + 1]);
    }
  };

  // Month navigation or formatting helpers
  const monthIndex = Number(mes) - 1;
  const currentYear = Number(anio);

  // Days in month calculation (Monday-first)
  const firstDay = new Date(currentYear, monthIndex, 1);
  const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, monthIndex, 0).getDate();

  const startOffset = (firstDay.getDay() + 6) % 7;
  const todayStr = new Date().toISOString().split("T")[0];

  // Construct grid cells (35 or 42 slots)
  const gridCells = [];

  // Previous month padding
  for (let i = startOffset - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    gridCells.push({
      dayNumber: dayNum,
      dateString: "",
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(monthIndex + 1).padStart(2, "0");
    const dayStr = String(d).padStart(2, "0");
    const dateString = `${currentYear}-${monthStr}-${dayStr}`;
    const isToday = dateString === todayStr;

    gridCells.push({
      dayNumber: d,
      dateString,
      isCurrentMonth: true,
      isToday
    });
  }

  // Next month padding to reach full rows (multiples of 7)
  const totalSlots = Math.ceil(gridCells.length / 7) * 7;
  const nextPadding = totalSlots - gridCells.length;
  for (let n = 1; n <= nextPadding; n++) {
    gridCells.push({
      dayNumber: n,
      dateString: "",
      isCurrentMonth: false
    });
  }

  const handlePostCardClick = (post, e) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }
    setSelectedPost(post);
  };

  // Mobile selected day state
  const [selectedMobileDate, setSelectedMobileDate] = useState(todayStr);

  return (
    <div className="space-y-4 font-inter">
      {/* DESKTOP CALENDAR GRID */}
      <CalendarDesktopGrid
        gridCells={gridCells}
        posts={posts}
        readOnly={readOnly}
        onDayClick={onDayClick}
        handlePostCardClick={handlePostCardClick}
      />

      {/* MOBILE NATIVE-STYLE CALENDAR */}
      <CalendarMobileView
        gridCells={gridCells}
        posts={posts}
        readOnly={readOnly}
        selectedMobileDate={selectedMobileDate}
        setSelectedMobileDate={setSelectedMobileDate}
        onDayClick={onDayClick}
        onPostClick={onPostClick}
        handlePostCardClick={handlePostCardClick}
      />

      {/* Instagram Post Preview Lightbox Modal */}
      {selectedPost && (
        <InstagramPostPreviewModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          isInternal={!readOnly}
          hasPrevPost={hasPrevPost}
          hasNextPost={hasNextPost}
          onPrevPost={goToPrevPost}
          onNextPost={goToNextPost}
          onEdit={!readOnly && onPostClick ? (postToEdit) => {
            setSelectedPost(null);
            onPostClick(postToEdit);
          } : null}
        />
      )}
    </div>
  );
}
