import { format } from '@/libs/duration.ts';
import type { Feed, Item } from '@/libs/podcast.d.ts';

export const buildXML = (
  { title, author, description, link, image, items }: Feed,
) => `
<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:psc="http://podlove.org/simple-chapters" xmlns:podcast="https://podcastindex.org/namespace/1.0">
  <channel>
    <title><![CDATA[${title}]]></title>
    <description><![CDATA[${description}]]></description>
    <link>${link}</link>
    <generator>podcast creator</generator>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <ttl>5</ttl>
    <itunes:author>${author}</itunes:author>
    <itunes:summary><![CDATA[${description}]]></itunes:summary>
    <itunes:owner>
      <itunes:name>${author}</itunes:name>
    </itunes:owner>
    <itunes:explicit>false</itunes:explicit>
    <itunes:image href="${image}"/>
    ${items.map((item) => buildItem(item)).join('\n')}
  </channel>
</rss>`;

const buildItem = (
  {
    title,
    description,
    link,
    pubDate = new Date(),
    enclosure_url,
    enclosure_type,
    duration,
    image,
  }: Item,
) => `
<item>
  <title><![CDATA[${title}]]></title>
  <description><![CDATA[${description}]]></description>
  <link>${link}</link>
  <guid isPermaLink="false">${btoa(link)}</guid>
  <pubDate>${pubDate.toUTCString()}</pubDate>
  <enclosure url="${enclosure_url}" length="0" type="${enclosure_type}"/>
  <itunes:summary><![CDATA[${description}]]></itunes:summary>
  <itunes:explicit>false</itunes:explicit>
  <itunes:duration>${format(duration)}</itunes:duration>
  <itunes:image href="${image}"/>
  <itunes:title><![CDATA[${title}]]></itunes:title>
</item>`;
