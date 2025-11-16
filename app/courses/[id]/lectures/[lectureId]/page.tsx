"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Textarea } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Play, Video, FileText } from "lucide-react";

export default function EditLecturePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const lectureId = params.lectureId as string;
  
  const [lecture, setLecture] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchLecture();
  }, [lectureId]);

  const fetchLecture = async () => {
    try {
      const response = await fetch(`/api/lectures/${lectureId}`);
      if (response.ok) {
        const data = await response.json();
        setLecture(data);
        setTitle(data.title || "");
        setDescription(data.description || "");
      }
    } catch (error) {
      console.error("Error fetching lecture:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/lectures/${lectureId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        router.push(`/courses/${courseId}`);
      }
    } catch (error) {
      console.error("Error saving lecture:", error);
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("title", title);
      formData.append("description", description);

      const response = await fetch(`/api/lectures/${lectureId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message); // Log the success message about transcription
        await fetchLecture();
        setVideoFile(null);
        
        // Show success message
        alert("Video uploaded successfully! Transcription and summary generation started in background.");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Error uploading video. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AppLayout maxWidth="2xl">
      <div className="mb-6">
        <Link href={`/courses/${courseId}`}>
          <Button variant="light" size="sm" className="mb-4">
            ← Back to Course
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Edit Lecture
        </h1>
        <p className="text-muted-foreground">Update lecture details and upload video</p>
      </div>

      <div className="space-y-6">
        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Lecture Details</h2>
                <p className="text-sm text-muted-foreground">Update title and description</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter lecture title"
                variant="bordered"
                classNames={{
                  input: "text-base",
                  inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter lecture description"
                minRows={4}
                variant="bordered"
                classNames={{
                  input: "text-base",
                  inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                }}
              />
            </div>

            <Button 
              color="primary" 
              onClick={handleSave}
              size="lg"
              className="font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Save Changes
            </Button>
          </CardBody>
        </Card>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Video Upload</h2>
                <p className="text-sm text-muted-foreground">
                  Videos are automatically transcribed and summarized using AI after upload
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            {lecture?.videoPath && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Current video:</p>
                <div className="rounded-xl overflow-hidden border-2 border-border">
                  <video
                    controls
                    className="w-full"
                    src={lecture.videoPath}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            <div className="space-y-4 p-4 rounded-xl border-2 border-dashed border-border bg-muted/20">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Upload New Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                {videoFile && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Selected: {videoFile.name}
                  </p>
                )}
              </div>

              <Button
                color="secondary"
                onClick={handleVideoUpload}
                isLoading={isUploading}
                disabled={!videoFile || isUploading}
                size="lg"
                className="w-full font-semibold"
              >
                {isUploading ? "Uploading..." : "Upload Video"}
              </Button>
              {!isUploading && videoFile && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-foreground flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <span>After upload, the video will be automatically transcribed and summarized. This may take a few minutes depending on video length.</span>
                  </p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}