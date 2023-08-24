import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { SignInButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import Image from "next/image";
import { LoadingPage } from "~/components/loading";

dayjs.extend(relativeTime)

const CreatePostWizard = () => {
  const {user} = useUser();
  if(!user) { return null; }

  return (
    <div className="flex gap-3 w-full">
      <Image src={user.profileImageUrl} alt="Profile Image" className="w-14 h-14 rounded-full" width={56} height={56}/>
      <input placeholder="type something" className="bg-transparent grow outline-none" />
    </div>
  );
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const {post, author} = props;

  return (
    <div key={post.id} className="flex p-4 border-b border-slate-400 gap-3">
      <Image src={author.profilePicture} alt={`@${author.name}'s profile picture`} className="w-14 h-14 rounded-full" width={56} height={56}/>
      <div className="flex flex-col text-slate-300">
        <div className="flex gap-1">
          <span className="font-bold">{ `@${author.name} `}</span>
          <span className="font-thin">{ ` · ${dayjs(post.createdAt).fromNow()} `}</span>
        </div>
        <span className="text-xl">{post.content}</span>
      </div>
    </div>
  );
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};


export default function Home() {
  const { isLoaded: userLoaded, isSignedIn} = useUser();

  api.posts.getAll.useQuery();

  if(!userLoaded) { return <div />}
  
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen border-slate-200">
        <div className="h-full w-full md:max-w-2xl border-x">
          <div className="border-b border-stale-400 p-4">
            {!isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
            {!!isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
}
