import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GitHubEvent {
    id: string;
    type: string;
    actor: {
        display_login: string;
    };
    repo: {
        name: string;
        url: string;
    };
    payload: {
        action?: string;
        commits?: Array<{
            sha: string;
            message: string;
            url: string;
        }>;
        pull_request?: {
            title: string;
            html_url: string;
        };
    };
    created_at: string;
}

const GitHubActivity: React.FC = () => {
    const [events, setEvents] = useState<GitHubEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGitHubEvents = async () => {
            try {
                const response = await fetch(
                    "https://api.github.com/users/metalpoch/events/public"
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch GitHub activity");
                }
                const data = await response.json();
                // Filter for meaningful events: PushEvent, PullRequestEvent, CreateEvent
                const filteredEvents = data
                    .filter((event: any) =>
                        ["PushEvent", "PullRequestEvent", "CreateEvent"].includes(event.type)
                    )
                    .slice(0, 5);
                setEvents(filteredEvents);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchGitHubEvents();
    }, []);

    const getEventMessage = (event: GitHubEvent) => {
        switch (event.type) {
            case "PushEvent":
                const commitCount = event.payload.commits?.length || 0;
                if (commitCount === 0) {
                    return `Pushed to ${event.repo.name}`;
                }
                return `Pushed ${commitCount} commit${commitCount !== 1 ? "s" : ""} to ${event.repo.name}`;
            case "PullRequestEvent":
                return `${event.payload.action === "opened" ? "Opened" : "Closed"} PR: ${event.payload.pull_request?.title} in ${event.repo.name}`;
            case "CreateEvent":
                return `Created repository ${event.repo.name}`;
            default:
                return `Activity in ${event.repo.name}`;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-neutral-500 text-sm py-8 text-center">
                No se pudo cargar la actividad de GitHub.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <AnimatePresence>
                {events.map((event, index) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative flex items-start gap-4 p-4 rounded-xl border border-neutral-800/50 bg-neutral-900/20 backdrop-blur-sm transition-all hover:border-neutral-700/50 hover:bg-neutral-800/30"
                    >
                        <div className="mt-1 flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-neutral-200">
                                {getEventMessage(event)}
                            </span>
                            <span className="text-xs text-neutral-500">
                                {new Date(event.created_at).toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                        <a
                            href={`https://github.com/${event.repo.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 z-10"
                            aria-label={`Ver repo ${event.repo.name}`}
                        ></a>
                    </motion.div>
                ))}
            </AnimatePresence>
            <a
                href="https://github.com/metalpoch"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors mt-2"
            >
                Ver todo el perfil
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3 h-3"
                >
                    <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                        clipRule="evenodd"
                    ></path>
                </svg>
            </a>
        </div>
    );
};

export default GitHubActivity;
