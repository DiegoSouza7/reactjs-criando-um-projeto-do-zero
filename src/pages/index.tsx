import { GetStaticProps } from 'next';
import Link from 'next/link'
import { FaRegCalendarAlt, FaUser } from 'react-icons/fa'
import Prismic from '@prismicio/client'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useEffect, useState } from 'react';

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
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [next_page, setNextPage] = useState('')
  const results = postsPagination.results

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
            first_publication_date: format(
              new Date(post.first_publication_date),
              "dd MMM' 'yyyy",
              {
                locale: ptBR,
              }
            ),
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
    <main className={commonStyles.container}>
      {posts.map(post => (
        <Link key={post.uid} href={`/post/`}>
          <div className={styles.content}>
            <h1>{post.data.title}</h1>
            <p>{post.data.subtitle}</p>
            <div className={styles.info}>
              <div>
                <FaRegCalendarAlt />
                {post.first_publication_date}
              </div>
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
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 2,
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        "dd MMM' 'yyyy",
        {
          locale: ptBR,
        }
      ),
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
        next_page: postsResponse.next_page
      }
    },
    revalidate: 60 * 30
  }
};
