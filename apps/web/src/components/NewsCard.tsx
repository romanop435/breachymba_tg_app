import { BreachCard } from './ui/BreachCard';
import { BreachButton } from './ui/BreachButton';
import { BreachChip } from './ui/BreachChip';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/format';
import { motion } from 'framer-motion';

export function NewsCard({ post }: { post: any }) {
  const hazard = post.isPinned || (post.tags || []).includes('AUTO');
  return (
    <motion.div layout transition={{ type: 'spring', stiffness: 320, damping: 28 }}>
      <BreachCard hazard={hazard} className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{post.title}</div>
          <div className="text-xs text-text1">{formatDate(post.publishedAt)}</div>
        </div>
        {post.isPinned ? <BreachChip label="PINNED" tone="auto" /> : null}
      </div>
      <div className="text-sm text-text1">{post.summary}</div>
      <div className="flex flex-wrap gap-2">
        {(post.tags || []).map((tag: string) => (
          <BreachChip key={tag} label={tag} tone={tag === 'AUTO' ? 'auto' : 'default'} />
        ))}
      </div>
      <div className="flex gap-2">
        <Link to={`/news/${post.id}`}>
          <BreachButton variant="subtle">Details</BreachButton>
        </Link>
        {post.hasPatchNotes ? (
          <Link to={`/news/${post.id}#patch`}>
            <BreachButton variant="ghost">Patch notes</BreachButton>
          </Link>
        ) : null}
      </div>
      </BreachCard>
    </motion.div>
  );
}
