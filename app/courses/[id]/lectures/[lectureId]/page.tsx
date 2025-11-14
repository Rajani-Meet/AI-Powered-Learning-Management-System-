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

      const response = await fetch(`/api/lectures/${lectureId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await fetchLecture();
        setVideoFile(null);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
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
    <AppLayout>
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/courses/${courseId}`}>
          <Button variant="light" size="sm">
            ← Back to Course
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Lecture</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Lecture Details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter lecture title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter lecture description"
                minRows={3}
              />
            </div>

            <Button color="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Video Upload</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {lecture?.videoUrl && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Current video:</p>
                <video
                  controls
                  className="w-full max-w-md rounded-lg"
                  src={`/api/videos/${lecture.videoUrl}`}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            <div>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="mb-2"
              />
              {videoFile && (
                <p className="text-sm text-gray-600">
                  Selected: {videoFile.name}
                </p>
              )}
            </div>

            <Button
              color="secondary"
              onClick={handleVideoUpload}
              isLoading={isUploading}
              disabled={!videoFile || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Video"}
            </Button>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}