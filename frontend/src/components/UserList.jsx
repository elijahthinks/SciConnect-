import { Link } from 'react-router-dom';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../store/auth';
import FollowButton from './FollowButton';
import UserAvatar from './UserAvatar';

export default function UserList({ users, emptyMessage, onFollowChange, showFollowButton = false }) {
  const { user } = useAuth();

  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-white shadow rounded-lg">
        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
        <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
      {users.map(person => (
        <div key={person.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <Link
            to={`/profile/${person.id}`}
            className="flex items-center flex-1 min-w-0"
          >
            <div className="flex-shrink-0">
              <UserAvatar user={person} size="md" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {person.name}
              </p>
              {(person.position || person.institution) && (
                <p className="text-sm text-gray-500 truncate">
                  {[person.position, person.institution]
                    .filter(Boolean)
                    .join(' at ')}
                </p>
              )}
              {person.bio && (
                <p className="text-sm text-gray-500 truncate mt-1">
                  {person.bio}
                </p>
              )}
            </div>
          </Link>
          
          {user && user.id !== person.id && showFollowButton && (
            <div className="ml-4">
              <FollowButton
                userId={person.id}
                onFollowChange={onFollowChange}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 