import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_ME } from '../../graphql/queries';
import { User } from 'lucide-react';

const UserProfile = () => {
  const { data, loading, error } = useQuery(GET_ME);

  if (loading) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !data?.me) {
    return (
      <div className="flex items-center gap-3 text-red-500 text-sm">
        Failed to load user.
      </div>
    );
  }

  const { name, email, avatar } = data.me;

  return (
    <div className="flex items-center gap-3">
      {avatar ? (
        <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-700" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
          <User size={20} />
        </div>
      )}
      <div className="flex flex-col overflow-hidden">
        <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">{name}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{email}</span>
      </div>
    </div>
  );
};

export default UserProfile;
