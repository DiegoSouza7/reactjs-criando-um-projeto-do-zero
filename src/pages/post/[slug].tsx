import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FaRegCalendarAlt, FaUser, FaRegClock } from 'react-icons/fa';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Prismic from '@prismicio/client'
import { useRouter } from 'next/router';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className={styles.container}>
        <div><p>Carregando...</p></div>
      </div>
    )
  }

  const minutesRead = Math.ceil(post.data.content.reduce(
    (acc, value) => acc + (
      (value.heading.split(' ')).length +
      RichText.asText(value.body).split(' ').length
    ), 0
  ) / 200)

  return (
    <>
      <Header />
      <img
        src={post.data.banner.url}
        alt={`Banner ${post.data.title}`}
        className={styles.banner}
      />

      <main className={commonStyles.container}>
        <div className={styles.header}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <time>
              <FaRegCalendarAlt />
              {format(
                new Date(post.first_publication_date),
                'dd MMM yyyy',
                {
                  locale: ptBR,
                }
              )}
            </time>
            <div>
              <FaUser />
              {post.data.author}
            </div>
            <div>
              <FaRegClock />
              {minutesRead} min
            </div>
          </div>

          <div className={styles.firstPublicationDate}>
            {`* editado em ${format(
                new Date(post.first_publication_date),
                "'Dia' dd 'de' MMMM', às ' HH:mm'",
                {
                  locale: ptBR,
                }
              )}`}
          </div>
          {post.data.content.map((content, index) => (
            <section key={index}>
              <h1>{content.heading}</h1>
              <div
                className={styles.postbody}
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }}
              />
            </section>
          ))}
        </div>
        <div>
          <h1></h1>
        </div> 
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ]);

  const paths = posts.results.map(post => ({
    params: { slug: post.uid }
  }))

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content
    }
  }

  return {
    props: {
      post
    },
    revalidate: 60 * 30
  }
};
