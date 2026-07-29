import { NextResponse } from 'next/server';
import { db } from '@/packages/db';

const HASHNODE_API = 'https://gql.hashnode.com';

const PUBLISH_MUTATION = `
  mutation PublishPost($input: PublishPostInput!) {
    publishPost(input: $input) {
      post {
        id
        slug
        title
        url
      }
    }
  }
`;

export async function POST(request) {
  try {
    const { title, content, excerpt, coverImage, hashtags } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const settings = await db.settings.get();
    const token = settings.hashnodeToken;
    const publicationId = settings.hashnodePublicationId;

    if (!token || !publicationId) {
      return NextResponse.json({ error: 'Hashnode PAT and Publication ID must be set in Settings first' }, { status: 400 });
    }

    const tags = (hashtags || []).filter(Boolean).map((t) => {
      const slug = t.replace(/^#/, '').toLowerCase().replace(/\s+/g, '-');
      return { slug };
    });

    const input = {
      publicationId,
      title,
      contentMarkdown: content,
      tags: tags.length > 0 ? tags : undefined,
      coverImageOptions: coverImage ? { coverImageURL: coverImage } : undefined,
      settings: excerpt ? { excerpt } : undefined,
    };

    const res = await fetch(HASHNODE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({ query: PUBLISH_MUTATION, variables: { input } }),
    });

    const json = await res.json();

    if (json.errors) {
      const msg = json.errors.map((e) => e.message).join('; ');
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const post = json.data?.publishPost?.post;
    if (!post) {
      return NextResponse.json({ error: 'Hashnode returned an unexpected response' }, { status: 500 });
    }

    await db.logs.create({ action: 'hashnode.publish', status: 'ok', meta: { title, url: post.url } });

    return NextResponse.json({ ok: true, url: post.url, id: post.id, slug: post.slug });
  } catch (e) {
    console.error('Hashnode publish error', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
