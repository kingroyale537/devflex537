"use client";
import { PORTFOLIO_GITHUB_LINK } from "@/lib/constants";
import { motion } from "framer-motion";

export default function NextContributorCard({ index }: { index: number }) {
  const openGithub = () => {
    window.open(PORTFOLIO_GITHUB_LINK, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl border-2 border-dashed border-[#B9FF66] cursor-pointer transition-shadow"
      onClick={openGithub}
    >
      <div className="aspect-square relative flex items-center justify-center bg-gray-50 h-[220px]">
        <div className="text-6xl">👋</div>
      </div>
      <div className="p-4 text-center border-t border-black bg-white">
        <h3 className="text-lg font-semibold mb-1 text-black">You?</h3>
        <p className="text-gray-600 text-sm mb-2">@nextcontributor</p>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
          Join us and help make PortfolioMaker even better!
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-[#B9FF66] text-black px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#a7eb54] border border-black transition-colors"
        >
          Contribute Now
        </motion.button>
      </div>
    </motion.div>
  );
}
