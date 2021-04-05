import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaRegCalendarAlt, FaUser } from 'react-icons/fa';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
  preview: boolean;
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [next_page, setNextPage] = useState('')
  const results = postsPagination.results
  const preview = postsPagination.preview

  useEffect(() => {
    setNextPage(postsPagination.next_page)
  }, [])

  useEffect(() => {
    setPosts(results)
  }, [results])


  function handleNewPagePosts() {
    fetch(next_page).then(content => content.json())
      .then(response => {
        const post = response.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            }
          }
        })

        const newPosts = posts.concat(post)
        setPosts(newPosts)

        setNextPage(response.next_page)

        return
      });
  }

  return (
    <>
      <Header />
      <main className={commonStyles.container}>
        {posts.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <div className={styles.content}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div className={styles.info}>
                <time>
                  <FaRegCalendarAlt />
                  {format(
                    new Date(post.first_publication_date),
                    "dd MMM' 'yyyy",
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <div>
                  <FaUser />
                  {post.data.author}
                </div>
              </div>
            </div>
          </Link>
        ))}

        {next_page && (<footer className={styles.footer}>
          <button onClick={handleNewPagePosts}>
            Carregar mais posts
        </button>
        </footer>)}
        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 2,
    ref: previewData?.ref ?? null,
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page,
        preview
      }
    },
    revalidate: 60 * 30
  }
};
