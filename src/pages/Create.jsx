import { useNavigate } from "react-router";
import SEO from "@/components/SEO";
import PageHeader from "@/components/PageHeader";
import PostComposer from "@/components/PostComposer";

export default function Create() {
  const navigate = useNavigate();
  return (
    <>
      <SEO title="Create post" description="Share something with your followers." />
      <PageHeader title="Create post" subtitle="Share a thought or a photo with your followers" />
      <PostComposer autoFocus onPosted={() => navigate("/")} />
    </>
  );
}
