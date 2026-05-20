import React, { useState } from "react";
import {
  Shield,
  Home,
  GraduationCap,
  Plane,
  Plus,
  Trash2,
  Check,
  Target,
  Calendar,
  TrendingUp,
  Car,
  Briefcase,
} from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import PageHeader from "../components/PageHeader.jsx";
import { fmt } from "../utils/format.js";
import { useToast, useLocalStorage } from "../context/AppContext.jsx";
import { useTranslate } from "../translate.js";

const initialGoals = [
  {
    id: 1,
    name: "Emergency Fund",
    target: 25000,
    current: 19500,
    monthly: 500,
    deadline: "2026-09",
    color: "#2a7d4f",
    category: "Safety",
  },
  {
    id: 2,
    name: "House Down Payment",
    target: 80000,
    current: 33600,
    monthly: 1200,
    deadline: "2028-06",
    color: "#c9a84c",
    category: "Housing",
  },
  {
    id: 3,
    name: "Retirement",
    target: 1500000,
    current: 465000,
    monthly: 1800,
    deadline: "2045-01",
    color: "#4c7dc9",
    category: "Retirement",
  },
  {
    id: 4,
    name: "Dream Vacation",
    target: 8000,
    current: 3200,
    monthly: 300,
    deadline: "2026-12",
    color: "#c94c7d",
    category: "Lifestyle",
  },
  {
    id: 5,
    name: "Children's Education",
    target: 120000,
    current: 24000,
    monthly: 600,
    deadline: "2036-08",
    color: "#7d4cc9",
    category: "Education",
  },
];

function monthsLeft(deadline) {
  const [y, m] = deadline.split("-").map(Number);
  const now = new Date();
  return (y - now.getFullYear()) * 12 + (m - now.getMonth());
}

function projectedDate(goal) {
  const remaining = goal.target - goal.current;
  if (goal.monthly <= 0) return "—";
  const months = Math.ceil(remaining / goal.monthly);
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// Professional icon components
const Icons = {
  Shield: () => <Shield className="w-5 h-5" />,
  Home: () => <Home className="w-5 h-5" />,
  Retirement: () => <TrendingUp className="w-5 h-5" />,
  Vacation: () => <Plane className="w-5 h-5" />,
  Education: () => <GraduationCap className="w-5 h-5" />,
  Add: () => <Plus className="w-4 h-4" />,
  Contribute: () => <Plus className="w-3.5 h-3.5" />,
  Remove: () => <Trash2 className="w-3.5 h-3.5" />,
  Check: () => <Check className="w-3.5 h-3.5" />,
  Target: () => <Target className="w-4 h-4" />,
  Calendar: () => <Calendar className="w-4 h-4" />,
  Monthly: () => <Calendar className="w-4 h-4" />,
  CategoryIcon: ({ category }) => {
    const icons = {
      Safety: <Icons.Shield />,
      Housing: <Icons.Home />,
      Retirement: <Icons.Retirement />,
      Lifestyle: <Icons.Vacation />,
      Education: <Icons.Education />,
      Travel: <Icons.Vacation />,
      Vehicle: <Car className="w-5 h-5" />,
      Business: <Briefcase className="w-5 h-5" />,
      Other: <Icons.Target />,
    };
    return (
      <div className="text-gray-600 dark:text-gray-200">
        {icons[category] || <Icons.Target />}
      </div>
    );
  },
};

export default function GoalsTracker() {
  const toast = useToast();
  const t = useTranslate();
  const [goals, setGoals] = useLocalStorage("wp_goals", initialGoals);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    target: "",
    current: "",
    monthly: "",
    deadline: "",
    category: "Savings",
  });
  const [selected, setSelected] = useState(null);
  const [contribution, setContribution] = useState("");

  const handleAdd = () => {
    if (!form.name || !form.target) {
      toast.error(
        "Validation Error",
        "Please enter a goal name and target amount.",
      );
      return;
    }
    setGoals((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: form.name,
        target: parseFloat(form.target) || 0,
        current: parseFloat(form.current) || 0,
        monthly: parseFloat(form.monthly) || 0,
        deadline: form.deadline || "2030-01",
        icon: form.icon,
        color: ["#2a7d4f", "#c9a84c", "#4c7dc9", "#c94c7d", "#7d4cc9"][
          prev.length % 5
        ],
        category: form.category,
      },
    ]);
    setForm({
      name: "",
      target: "",
      current: "",
      monthly: "",
      deadline: "",
      category: "Savings",
    });
    setShowAdd(false);
    toast.success(
      "Goal Created",
      `"${form.name}" has been added to your goals!`,
    );
  };

  const handleContribute = () => {
    const amt = parseFloat(contribution);
    if (!amt || amt <= 0) {
      toast.error(
        "Invalid Amount",
        "Please enter a valid contribution amount.",
      );
      return;
    }
    if (!selected) return;
    const goal = goals.find((g) => g.id === selected.id);
    const newCurrent = Math.min(
      (goal?.current || 0) + amt,
      goal?.target || amt,
    );
    setGoals((prev) =>
      prev.map((g) =>
        g.id === selected.id ? { ...g, current: newCurrent } : g,
      ),
    );
    setContribution("");
    setSelected(null);
    const finished = newCurrent >= (goal?.target || Infinity);
    if (finished)
      toast.success(
        " Goal Achieved!",
        `Congratulations! You reached your "${goal?.name}" goal!`,
      );
    else
      toast.success(
        "Contribution Added",
        `$${amt.toLocaleString()} added to "${goal?.name}".`,
      );
  };

  const totalSaved = goals.reduce((s, g) => s + g.current, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const completed = goals.filter((g) => g.current >= g.target).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 animate-fadeIn">
      <PageHeader
        title={t("Goals Tracker")}
        subtitle={t("Set, track, and achieve your financial milestones")}
        actions={
          <button
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
            onClick={() => setShowAdd(true)}
          >
            <Icons.Add />
            {t("New Goal")}
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">
            Active Goals
          </div>
          <div className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
            {goals.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">
            Total Saved
          </div>
          <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {fmt(totalSaved)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">
            Total Target
          </div>
          <div className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400">
            {fmt(totalTarget)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 mb-2">
            Completed
          </div>
          <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
            {completed}
          </div>
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full animate-fadeIn shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t("Create New Goal")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Name
                </label>
                <input
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Ex. Buying House"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Amount ($)
                </label>
                <input
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  type="number"
                  placeholder="10000"
                  value={form.target}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, target: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Savings ($)
                </label>
                <input
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  type="number"
                  placeholder="0"
                  value={form.current}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, current: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Contribution ($)
                </label>
                <input
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  type="number"
                  placeholder="200"
                  value={form.monthly}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, monthly: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Date
                </label>
                <input
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  type="month"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, deadline: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  value={form.category}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category: e.target.value }))
                  }
                >
                  {[
                    "Safety",
                    "Housing",
                    "Retirement",
                    "Lifestyle",
                    "Education",
                    "Travel",
                    "Vehicle",
                    "Business",
                    "Other",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all"
                onClick={handleAdd}
              >
                {t("Create New Goal")}
              </button>
              <button
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all"
                onClick={() => setShowAdd(false)}
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full animate-fadeIn shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t("Add Contribution")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {selected.name} · {fmt(selected.current)} saved
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount ($)
            </label>
            <input
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors mb-4"
              type="number"
              placeholder="500"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                onClick={handleContribute}
              >
                <Icons.Contribute />
                {t("Add Funds")}
              </button>
              <button
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-all"
                onClick={() => setSelected(null)}
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const pct = Math.min((goal.current / goal.target) * 100, 100);
          const ml = monthsLeft(goal.deadline);
          const done = goal.current >= goal.target;
          const remaining = goal.target - goal.current;

          return (
            <div
              key={goal.id}
              className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:scale-[1.02] duration-200 overflow-hidden"
            >
              <div
                className="absolute top-0 right-0 w-20 h-20 pointer-events-none opacity-30 dark:opacity-20"
                style={{
                  background: `radial-gradient(circle at top right, ${goal.color}, transparent 70%)`,
                }}
              />

              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center">
                    {goal.category === "Safety" && <Icons.Shield />}
                    {goal.category === "Housing" && <Icons.Home />}
                    {goal.category === "Retirement" && <Icons.Retirement />}
                    {goal.category === "Lifestyle" && <Icons.Vacation />}
                    {goal.category === "Education" && <Icons.Education />}
                    {goal.category === "Travel" && <Icons.Vacation />}
                    {![
                      "Safety",
                      "Housing",
                      "Retirement",
                      "Lifestyle",
                      "Education",
                      "Travel",
                    ].includes(goal.category) && <Icons.Target />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                      {goal.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {goal.category}
                    </div>
                  </div>
                </div>
                {done ? (
                  <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Icons.Check /> Done
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                    {ml}mo left
                  </span>
                )}
              </div>

              <div className="flex justify-between items-end mb-1">
                <span
                  className="text-2xl font-bold"
                  style={{ color: goal.color }}
                >
                  {fmt(goal.current)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  of {fmt(goal.target)}
                </span>
              </div>

              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: goal.color }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-500 mb-3">
                <span>{pct.toFixed(0)}% complete</span>
                <span>{fmt(remaining)} remaining</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 mb-1">
                    <Icons.Monthly />
                    <span>Monthly</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                    {fmt(goal.monthly)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 mb-1">
                    <Icons.Calendar />
                    <span>Projected</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                    {projectedDate(goal)}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1"
                  onClick={() => setSelected(goal)}
                >
                  <Icons.Contribute />
                  Contribute
                </button>
                <button
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1"
                  onClick={() => {
                    const g = goals.find((x) => x.id === goal.id);
                    setGoals((prev) => prev.filter((g) => g.id !== goal.id));
                    toast.info(
                      "Goal Removed",
                      `"${g?.name}" has been removed.`,
                    );
                  }}
                >
                  <Icons.Remove />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
