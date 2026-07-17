"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2, ArrowLeft, Save, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ProjectFormState {
  name: string;
  description: string;
  url: string;
  language: string;
  stars: string;
}

interface ExperienceFormState {
  title: string;
  company: string;
  location: string;
  description: string;
  startYear: string;
  startMonth: string;
  endYear: string;
  endMonth: string;
}

interface SocialAccountFormState {
  provider: string;
  url: string;
}

export default function CreateCustomPortfolio() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [socials, setSocials] = useState<SocialAccountFormState[]>([
    { provider: "linkedin", url: "" },
    { provider: "twitter", url: "" },
    { provider: "github", url: "" },
  ]);

  const [projects, setProjects] = useState<ProjectFormState[]>([
    { name: "", description: "", url: "", language: "TypeScript", stars: "0" },
  ]);

  const [experiences, setExperiences] = useState<ExperienceFormState[]>([
    {
      title: "",
      company: "",
      location: "Remote",
      description: "",
      startYear: new Date().getFullYear().toString(),
      startMonth: "1",
      endYear: "",
      endMonth: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Social account handlers
  const handleSocialChange = (index: number, val: string) => {
    const updated = [...socials];
    if (updated[index]) {
      updated[index].url = val;
      setSocials(updated);
    }
  };

  // Projects dynamic list handlers
  const addProject = () => {
    setProjects([
      ...projects,
      { name: "", description: "", url: "", language: "TypeScript", stars: "0" },
    ]);
  };

  const removeProject = (index: number) => {
    if (projects.length === 1) return;
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleProjectChange = (index: number, key: keyof ProjectFormState, val: string) => {
    const updated = [...projects];
    if (updated[index]) {
      updated[index][key] = val;
      setProjects(updated);
    }
  };

  // Experiences dynamic list handlers
  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        title: "",
        company: "",
        location: "Remote",
        description: "",
        startYear: new Date().getFullYear().toString(),
        startMonth: "1",
        endYear: "",
        endMonth: "",
      },
    ]);
  };

  const removeExperience = (index: number) => {
    if (experiences.length === 1) return;
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index: number, key: keyof ExperienceFormState, val: string) => {
    const updated = [...experiences];
    if (updated[index]) {
      updated[index][key] = val;
      setExperiences(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!username.trim() || !name.trim()) {
      setFormError("Username and Name are required fields.");
      return;
    }

    // Clean username format (no spaces or special characters)
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "");
    if (!cleanUsername) {
      setFormError("Please enter a valid username slug (letters, numbers, dashes only).");
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty social links
      const socialAccounts = socials.filter((s) => s.url.trim() !== "");

      // Filter out empty projects
      const validProjects = projects.filter((p) => p.name.trim() !== "");

      // Filter out empty experiences
      const validExperiences = experiences.filter((exp) => exp.title.trim() && exp.company.trim());

      const payload = {
        username: cleanUsername,
        name: name.trim(),
        bio: bio.trim(),
        location: location.trim(),
        avatar_url: avatarUrl.trim(),
        social_accounts: socialAccounts,
        projects: validProjects,
        experience: validExperiences,
      };

      const response = await fetch("/api/user/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create manual profile.");
      }

      const data = await response.json();
      router.push(`/${data.username}`);
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header Bar */}
      <header className="fixed w-full bg-white/70 backdrop-blur-md z-50 py-4 shadow-sm border-b border-black">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo-full.png"
              alt="PortfolioMaker"
              width={100}
              height={30}
              className="h-8 w-auto brightness-110"
              unoptimized
            />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 border border-black px-3 py-1.5 rounded-lg text-sm bg-white hover:bg-gray-50 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-black"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 pt-28 max-w-4xl">
        <div className="bg-[#B9FF66] border-2 border-black rounded-2xl p-6 md:p-8 mb-8 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <h1 className="text-3xl md:text-4xl font-bold text-black flex items-center gap-2">
            <Sparkles className="text-black" /> Create Manual Portfolio
          </h1>
          <p className="text-black/80 mt-2 font-medium">
            No GitHub? No problem! Customize your own professional developer profile by entering your projects and experiences manually.
          </p>
        </div>

        {formError && (
          <div className="bg-red-100 border-2 border-red-500 rounded-xl p-4 mb-6 text-red-700 font-semibold shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold text-black border-b-2 border-black pb-3 mb-6">
              1. Profile Info
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-black font-bold mb-2">Username / Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                  className="w-full border-2 border-black rounded-xl p-3 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#B9FF66]"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  Your portfolio will be live at: localhost:3000/{username || "username"}
                </span>
              </div>
              <div>
                <label className="block text-black font-bold mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 border-black rounded-xl p-3 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#B9FF66]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-black font-bold mb-2">Bio / Headline</label>
                <textarea
                  placeholder="e.g. Senior Frontend Engineer specializing in React, TypeScript, and interactive layouts."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-black rounded-xl p-3 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#B9FF66]"
                />
              </div>
              <div>
                <label className="block text-black font-bold mb-2">Location</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border-2 border-black rounded-xl p-3 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#B9FF66]"
                />
              </div>
              <div>
                <label className="block text-black font-bold mb-2">Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="e.g. https://domain.com/photo.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full border-2 border-black rounded-xl p-3 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#B9FF66]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Socials */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold text-black border-b-2 border-black pb-3 mb-6">
              2. Social Accounts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {socials.map((soc, idx) => (
                <div key={soc.provider}>
                  <label className="block text-black font-bold mb-2 capitalize">
                    {soc.provider} Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder={`https://${soc.provider}.com/in/username`}
                    value={soc.url}
                    onChange={(e) => handleSocialChange(idx, e.target.value)}
                    className="w-full border-2 border-black rounded-xl p-3 bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#B9FF66]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Projects */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-6">
              <h2 className="text-2xl font-bold text-black">3. Featured Projects</h2>
              <button
                type="button"
                onClick={addProject}
                className="flex items-center gap-1.5 border-2 border-black px-3 py-1.5 rounded-lg text-sm bg-[#B9FF66] hover:bg-[#a7eb54] text-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              >
                <Plus size={16} /> Add Project
              </button>
            </div>

            <div className="space-y-6">
              {projects.map((proj, idx) => (
                <div key={idx} className="border-2 border-black rounded-xl p-4 md:p-6 bg-gray-50/50 relative shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <div className="absolute right-4 top-4">
                    <button
                      type="button"
                      disabled={projects.length === 1}
                      onClick={() => removeProject(idx)}
                      className="text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="md:col-span-2">
                      <label className="block text-black text-sm font-bold mb-1">Project Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Neubrutalist Portfolio Maker"
                        value={proj.name}
                        onChange={(e) => handleProjectChange(idx, "name", e.target.value)}
                        className="w-full border-2 border-black rounded-lg p-2.5 bg-white text-black font-medium focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-black text-sm font-bold mb-1">Description</label>
                      <input
                        type="text"
                        placeholder="A full stack Next.js app supporting manual inputs and scraper integrations."
                        value={proj.description}
                        onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
                        className="w-full border-2 border-black rounded-lg p-2.5 bg-white text-black font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-black text-sm font-bold mb-1">Project URL / Live Demo</label>
                      <input
                        type="url"
                        placeholder="https://example.com/demo"
                        value={proj.url}
                        onChange={(e) => handleProjectChange(idx, "url", e.target.value)}
                        className="w-full border-2 border-black rounded-lg p-2.5 bg-white text-black font-medium focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-black text-sm font-bold mb-1">Primary Language</label>
                        <input
                          type="text"
                          placeholder="e.g. TypeScript"
                          value={proj.language}
                          onChange={(e) => handleProjectChange(idx, "language", e.target.value)}
                          className="w-full border-2 border-black rounded-lg p-2.5 bg-white text-black font-medium focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-black text-sm font-bold mb-1">Stars Count</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={proj.stars}
                          onChange={(e) => handleProjectChange(idx, "stars", e.target.value)}
                          className="w-full border-2 border-black rounded-lg p-2.5 bg-white text-black font-medium focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Experience */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-6">
              <h2 className="text-2xl font-bold text-black">4. Work Experience</h2>
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-1.5 border-2 border-black px-3 py-1.5 rounded-lg text-sm bg-[#B9FF66] hover:bg-[#a7eb54] text-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              >
                <Plus size={16} /> Add Experience
              </button>
            </div>

            <div className="space-y-6">
              {experiences.map((exp, idx) => (
                <div key={idx} className="border-2 border-black rounded-xl p-4 md:p-6 bg-gray-50/50 relative shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <div className="absolute right-4 top-4">
                    <button
                      type="button"
                      disabled={experiences.length === 1}
                      onClick={() => removeExperience(idx)}
                      className="text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-black text-sm font-bold mb-1">Job Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Software Engineer"
                        value={exp.title}
                        onChange={(e) => handleExperienceChange(idx, "title", e.target.value)}
                        className="w-full border-2 border-black rounded-lg p-2.5 bg-white text-black font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-black text-sm font-bold mb-1">Company / Organization *</label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                        className="w-full border-2 border-black rounded-lg p-2.5 bg-white text-black font-medium focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-black text-sm font-bold mb-1">Job Description</label>
                      <textarea
                        placeholder="Lead engineering design. Set up scalable routing systems using Next.js."
                        value={exp.description}
                        onChange={(e) => handleExperienceChange(idx, "description", e.target.value)}
                        rows={2}
                        className="w-full border-2 border-black rounded-lg p-2.5 bg-white text-black font-medium focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-black text-sm font-bold mb-1">Start Year *</label>
                        <input
                          type="number"
                          placeholder="2024"
                          value={exp.startYear}
                          onChange={(e) => handleExperienceChange(idx, "startYear", e.target.value)}
                          className="w-full border-2 border-black rounded-lg p-2.5 bg-white text-black font-medium focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-black text-sm font-bold mb-1">Start Month (1-12)</label>
                        <input
                          type="number"
                          placeholder="e.g. 1"
                          value={exp.startMonth}
                          onChange={(e) => handleExperienceChange(idx, "startMonth", e.target.value)}
                          className="w-full border-2 border-black rounded-lg p-2.5 bg-white text-black font-medium focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-black text-sm font-bold mb-1">End Year (Leave blank if current)</label>
                        <input
                          type="number"
                          placeholder="Present"
                          value={exp.endYear}
                          onChange={(e) => handleExperienceChange(idx, "endYear", e.target.value)}
                          className="w-full border-2 border-black rounded-lg p-2.5 bg-white text-black font-medium focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-black text-sm font-bold mb-1">End Month (1-12)</label>
                        <input
                          type="number"
                          placeholder=""
                          value={exp.endMonth}
                          onChange={(e) => handleExperienceChange(idx, "endMonth", e.target.value)}
                          className="w-full border-2 border-black rounded-lg p-2.5 bg-white text-black font-medium focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Link
              href="/"
              className="border-2 border-black px-6 py-3 rounded-xl bg-white text-black font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              Cancel
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 border-2 border-black px-8 py-3 rounded-xl bg-[#B9FF66] text-black font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-60 cursor-pointer"
            >
              <Save size={20} />
              {isSubmitting ? "Creating Profile..." : "Create Portfolio"}
            </motion.button>
          </div>
        </form>
      </main>
    </div>
  );
}
