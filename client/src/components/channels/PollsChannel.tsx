import { useState, useEffect } from 'react';
import {
  BarChart2,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import api from '../../config/api';
import type { IPoll } from '../../types';

interface Props {
  channelId: string;
}

export default function PollsChannel({ channelId }: Props) {
  const { user } = useUser();
  const [polls, setPolls] = useState<IPoll[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (channelId) {
      fetchPolls();
    }
  }, [channelId]);

  const fetchPolls = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/api/polls/channel/${channelId}`);
      setPolls(data);
    } catch (error) {
      console.error('Failed to fetch polls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionIds: string[]) => {
    try {
      const { data } = await api.post(`/api/polls/${pollId}/vote`, {
        optionIds,
      });
      setPolls((prev) => prev.map((p) => (p._id === pollId ? data : p)));
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const filteredPolls = polls
    .filter((poll) => {
      if (filter === 'active') return poll.status === 'active';
      if (filter === 'ended') return poll.status === 'ended';
      return true;
    })
    .filter((poll) =>
      poll.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const calculatePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  return (
    <div className="flex-1 p-6 bg-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">Polls</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search polls..."
              className="pl-9 pr-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Polls</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>
          <button className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : filteredPolls.length > 0 ? (
        <div className="space-y-4">
          {filteredPolls.map((poll) => {
            const totalVotes = poll.options.reduce(
              (sum, opt) => sum + opt.votes,
              0
            );
            const hasVoted = poll.options.some((opt) =>
              opt.voterIds?.includes(user?.id || '')
            );
            const canSeeResults =
              hasVoted ||
              poll.settings?.showResultsBeforeEnd ||
              poll.status === 'ended';

            return (
              <div key={poll._id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-medium text-white mb-1">
                      {poll.title}
                    </h3>
                    {poll.description && (
                      <p className="text-gray-400 text-sm mb-2">
                        {poll.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {totalVotes} votes
                      </div>
                      {poll.settings?.endDate && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(poll.settings.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  {poll.status === 'ended' && (
                    <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                      Ended
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {poll.options.map((option) => {
                    const percentage = calculatePercentage(
                      option.votes,
                      totalVotes
                    );
                    const hasVotedForThis = option.voterIds?.includes(
                      user?.id || ''
                    );

                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          if (poll.status === 'active' && !hasVoted) {
                            handleVote(poll._id, [option.id]);
                          }
                        }}
                        disabled={poll.status === 'ended' || hasVoted}
                        className={`w-full relative p-3 rounded-lg transition-colors ${
                          hasVotedForThis
                            ? 'bg-indigo-500/20 border-2 border-indigo-500'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-white">{option.text}</span>
                          {canSeeResults && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-400">
                                {option.votes} votes
                              </span>
                              <span className="text-sm text-gray-400">
                                {percentage}%
                              </span>
                            </div>
                          )}
                        </div>
                        {canSeeResults && (
                          <div
                            className="absolute inset-0 bg-indigo-500/10 rounded-lg transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {hasVoted && (
                  <div className="mt-4 text-sm text-gray-400 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                    You have voted
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <BarChart2 className="w-16 h-16 text-gray-500 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">
            No polls found
          </h3>
          <p className="text-gray-400">Create a new poll to get started</p>
        </div>
      )}
    </div>
  );
}
