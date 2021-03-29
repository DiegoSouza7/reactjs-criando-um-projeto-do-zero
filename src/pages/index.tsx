import { GetStaticProps } from 'next';
import { FaRegCalendarAlt, FaUser } from 'react-icons/fa'

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
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ }: HomeProps) {

  const teste = ['1', '2', '3', '4', '5', '6', '7']

  return (
    <main className={styles.container}>
      {teste.map(teste => (
        <div key={teste} className={styles.content}>
          <h1>Como utilizar Hooks</h1>
          <p>Pensando em sincronização em vez de ciclos de vida.</p>
          <div className={styles.info}>
            <div>
              <FaRegCalendarAlt />
                  15 Mar 2021
                </div>
            <div>
              <FaUser />
              Diego Souza
            </div>
          </div>
        </div>
      ))}

      <footer>
        <button>
          Carregar mais posts
        </button>
      </footer>
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  // const prismic = getPrismicClient();
  // const postsResponse = await prismic.query(TODO);

  // TODO

  return {
    props: {}
  }
};
