import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Database } from '../../../types/supabase';
import { type ResourceFlags, type ResourceItem  } from '../../../utils/eventUtils';
import { Monitor, CircleDot, Mic, FileText, Laptop, User, Smartphone } from 'lucide-react';
import { FaPoll } from "react-icons/fa";

type Event = Database['public']['Tables']['events']['Row'];



 const parseEventResources = (event: Event): ResourceFlags => {
  const resources = (event.resources as ResourceItem[]) || [];

  // Add icon, displayName, and isAVResource properties to each resource item
  const resourcesWithIcons = resources.map(item => {
    const name = item.itemName?.toLowerCase() || '';
    const isAVResource = name.startsWith('ksm-kgh-video') || 
                        name.startsWith('ksm-kgh-av') || 
                        name.endsWith('staff-assistance');
    
    return {
      ...item,
      icon: getAVResourceAvatar(item.itemName),
      displayName: getResourceDisplayName(item.itemName),
      isAVResource
    };
  });

  // Single pass through resources to compute all flags
  let hasVideoRecording = false;
  let hasStaffAssistance = false;
  let hasHandheldMic = false;
  let hasWebConference = false;
  let hasClickers = false;
  let hasAVNotes = false;
  let hasNeatBoard = false;
  
  for (const item of resourcesWithIcons) {
    const displayName = item.displayName;
    if (!displayName) continue;
    
    if (displayName.includes('Recording')) hasVideoRecording = true;
    if (displayName === 'Staff Assistance') hasStaffAssistance = true;
    if (displayName === 'Handheld Microphone') hasHandheldMic = true;
    if (displayName === 'Web Conference') hasWebConference = true;
    if (displayName === 'Clickers (Polling)') hasClickers = true;
    if (displayName === 'AV Setup Notes') hasAVNotes = true;
    if (displayName === 'Neat Board') hasNeatBoard = true;
  }

  return {
    resources: resourcesWithIcons,
    // Computed boolean flags
    hasVideoRecording,
    hasStaffAssistance,
    hasHandheldMic,
    hasWebConference,
    hasClickers,
    hasAVNotes,
    hasNeatBoard,
  };
};



/**
 * Get specific avatar component for AV resources
 */
export const getAVResourceAvatar = (itemName: string): React.ReactElement => {
  const name = itemName?.toLowerCase() || '';

  // Special case for web conferencing - should use Zoom icon image
  if (name.includes('video-conferencing') || name.includes('web conference') || name.includes('zoom')) {
    return <img src="/zoomicon.png" alt="Zoom" className="size-4" />;
  }

  // Special case for Surface Hub - should use TV icon
  if (name.includes('surface hub') || name.includes('ksm-kgh-av-surface hub')) {
    return <Monitor className="size-4" strokeWidth={2.5} />;
  }

  // Video-related resources
  if (name.includes('video-recording') || name.includes('recording')) {
    return <img src="/icons8-record-50.png" alt="Recording" className="size-4" />;
  }

  // Audio-related resources
  if (name.includes('handheld') || name.includes('mic')) {
    return <span className="text-sm">🎤</span>;
  }
  // Audio-related resources
  if (name.includes('lapel') || name.includes('mic')) {
   return <img src="/lapel.png" alt="Lapel Mic" className="size-4" />;
 }
  // Notes/assistance
  if (name.includes('staff') || name.includes('assistance')) {
    return (
      <div className="flex items-center justify-center rounded-full bg-green-500/90 w-4 h-4">
        <span className="text-white text-xs">🚶</span>
      </div>
    );
  }
  if (name.includes('notes') || name.includes('kis')) {
    return <FileText className="size-4" />;
  }

  // Computer/laptop resources
  if (name.includes('laptop') || name.includes('computer')) {
    return <Laptop className="size-4" />;
  }
  if (name.includes('polling') || name.includes('computer')) {
    return <FaPoll className="size-4 text-pink-500" />;
  }

  return <Smartphone className="size-4" />; // Default icon
};

