import { Clock, BarChart2, Award } from 'lucide-react';
import { formatTime } from '@/utils' 


interface VideoStatsProps {
  videoProgress: {
    currentTime: number;
    duration: number;
    percentage: number;
  }
}

const VideoStats = ({ videoProgress }: VideoStatsProps) => {
  return (
    <div className="p-4 bg-dark-lighter/20 rounded-lg">
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center p-3 rounded-md bg-dark-lighter/30 hover:bg-dark-lighter/40 transition-colors">
          <Clock size={20} className="text-accent-purple mb-2" />
          <span className="text-xs text-white/70">Time Watched</span>
          <span className="text-sm font-medium text-white">
            {formatTime(videoProgress.currentTime)} / {formatTime(videoProgress.duration)}
          </span>
        </div>
        
        <div className="flex flex-col items-center p-3 rounded-md bg-dark-lighter/30 hover:bg-dark-lighter/40 transition-colors">
          <BarChart2 size={20} className="text-accent-purple mb-2" />
          <span className="text-xs text-white/70">Progress</span>
          <span className="text-sm font-medium text-white">
            {Math.round(videoProgress.percentage)}%
          </span>
        </div>
        
        <div className="flex flex-col items-center p-3 rounded-md bg-dark-lighter/30 hover:bg-dark-lighter/40 transition-colors">
          <Award size={20} className={`mb-2 ${videoProgress.percentage >= 100 ? 'text-accent-purple' : 'text-white/30'}`} />
          <span className="text-xs text-white/70">Status</span>
          <span className="text-sm font-medium text-white">
            {videoProgress.percentage >= 100 ? 'Completed' : 'In Progress'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoStats;