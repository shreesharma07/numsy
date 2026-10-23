import { author } from '../../content/site';
import { Avatar, Button } from '../ui';
import './AuthorCard.css';

export function AuthorCard({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <div className="author">
      <div className="author__photo">
        <Avatar
          src={author.avatar}
          alt={`Portrait of ${author.name}`}
          name={author.name}
          size={220}
          fluid
        />
      </div>
      <div>
        <p className="label">{author.role}</p>
        <H className="display author__name">{author.name}</H>
        <p className="lede">{author.bio}</p>
        <div className="row">
          <Button variant="primary" href={author.website} icon="ph:globe-bold">
            shrikumarsharma.in
          </Button>
          <Button href={author.linkedin} icon="ph:linkedin-logo-bold">
            LinkedIn
          </Button>
          <Button href={author.githubUrl} icon="ph:github-logo-bold">
            GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
