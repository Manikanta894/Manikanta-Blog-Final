import { Github, Linkedin, Instagram, Facebook, Globe } from 'lucide-react';

// lucide-react has no Threads glyph yet, so it's hand-drawn here to match
// the stroke weight/size of the lucide icons around it.
function ThreadsIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16.5 3.5C15 2.6 13.2 2.2 11.4 2.3 7.6 2.5 4.8 5 4.3 8.7c-.4 3 .3 5.6 2 7.5 1.6 1.8 3.9 2.8 6.6 2.8 2.2 0 4-.6 5.3-1.8 1.2-1.1 1.9-2.6 1.9-4.3 0-2.6-1.6-4.4-4.3-4.9-.3-1.7-1.5-2.7-3.3-2.7-1.4 0-2.5.6-3.2 1.7l1.4.9c.4-.6 1-.9 1.8-.9.9 0 1.5.4 1.7 1.2-2.5.2-4.3 1.4-4.3 3.5 0 1.7 1.3 3 3.4 3 1.6 0 2.9-.7 3.6-2 .2.6.2 1.2.2 1.4 0 1-.4 1.8-1.1 2.4-.9.7-2.2 1.1-3.7 1.1-2.1 0-3.8-.7-5-2-1.2-1.4-1.8-3.4-1.4-5.8.4-2.8 2.4-4.6 5.1-4.7 1.4-.1 2.7.2 3.8.9.9.6 1.5 1.4 1.8 2.4l1.6-.4c-.4-1.4-1.3-2.6-2.5-3.4Zm-1.9 8.1c0 1.2-.9 1.9-2 1.9-.9 0-1.6-.5-1.6-1.2 0-.9.9-1.5 2.6-1.6.4 0 .7 0 1 .1v.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

const ICONS = {
  portfolio: Globe,
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  threads: ThreadsIcon,
};

export default function SocialIcon({ iconKey, size = 18, className = '' }) {
  const Icon = ICONS[iconKey] || Globe;
  return <Icon size={size} className={className} />;
}
