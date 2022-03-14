import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";

import {
  PostsDocument,
  PostsQueryResult,
  Post,
  usePostsQuery,
} from "generated/graphql";
import { initializeApollo, addApolloState } from "lib/apolloClient";
import { Layout } from "components/Layout";
import Image from "next/image";

interface HomePageProps {
  posts: Post[];
}

const Home: NextPage<HomePageProps> = () => {
  const { data, loading, fetchMore } = usePostsQuery({
    variables: { limit: 8, cursor: null as null | string },
  });

  return (
    <>
      <Head>
        <title>Home</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
          <h2 className="sr-only">Posts</h2>
          {!loading && data?.posts.posts && (
            <InfiniteScroll
              dataLength={data?.posts.posts.length || 0}
              next={async () => {
                await fetchMore({
                  variables: {
                    limit: 8,
                    cursor:
                      data?.posts.posts[data?.posts.posts.length - 1].createdAt,
                  },
                });
              }}
              hasMore={!!data?.posts.hasMore}
              loader="Loading more"
              endMessage={<h4>Nothing more to show</h4>}
            >
              <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                {data?.posts.posts.map((post) => (
                  <NextLink key={`post_${post.id}`} href={`/posts/${post.id}`}>
                    <a className="group">
                      <div className="bg-gray-200 rounded-lg overflow-hidden">
                        <Image
                          width="280"
                          height="320"
                          alt={`post_${post.id}_logo`}
                          src="https://tailwindui.com/img/ecommerce-images/category-page-04-image-card-03.jpg"
                          className="w-full h-full object-center object-cover group-hover:opacity-75"
                        />
                      </div>
                      <h3 className="mt-4 text-sm text-gray-700">
                        {post.title}
                      </h3>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {post.subText}
                      </p>
                    </a>
                  </NextLink>
                ))}
              </div>
              {/* <div className="flex items-center">
            <button
              className="bg-slate-700 rounded-md p-2 text-white"
              onClick={async () => {
                await fetchMore({
                  variables: {
                    limit: 8,
                    cursor: data?.posts[data?.posts.length - 1].createdAt,
                  },
                });
              }}
            >
              Load more
            </button>
          </div> */}
            </InfiniteScroll>
          )}
        </div>
      </Layout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const apolloClient = initializeApollo();

  const { data } = (await apolloClient.query({
    query: PostsDocument,
    variables: {
      limit: 8,
    },
  })) as PostsQueryResult;

  return addApolloState(apolloClient, {
    props: {
      posts: data?.posts,
    },
  });
};

export default Home;
