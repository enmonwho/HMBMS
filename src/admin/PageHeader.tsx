import { currentUser } from './mockData';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

interface PageHeaderProps {
  title: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="admin-page-head">
      <h1>{title}</h1>
      <div className="admin-userchip">
        <div className="admin-userchip-avatar">{initials(currentUser.name)}</div>
        <div>
          <div className="admin-userchip-name">{currentUser.name}</div>
          <div className="admin-userchip-role">{currentUser.role}</div>
        </div>
      </div>
    </div>
  );
}
