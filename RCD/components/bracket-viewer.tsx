"use client";
import { useEffect, useRef, useState } from "react";
import { api, type Bracket, type Match, type Team } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BracketViewerProps {
  tournamentId: string;
  initial?: Bracket | null;
  isAdmin?: boolean;
}

// Match card component
function MatchCard({
  match,
  nameFor,
  isAdmin,
  onReport,
  onEdit,
  onOverride,
  onReset,
}: {
  match: Match;
  nameFor: (id?: string | null) => string;
  isAdmin?: boolean;
  onReport: (m: Match) => void;
  onEdit: (m: Match) => void;
  onOverride: (m: Match) => void;
  onReset: (m: Match) => void;
}) {
  const isCompleted = match.status === "completed";
  const team1IsWinner = match.winnerId && match.winnerId === match.team1Id;
  const team2IsWinner = match.winnerId && match.winnerId === match.team2Id;

  return (
    <div
      className={`
        w-[200px] border rounded-lg overflow-hidden bg-card/80 backdrop-blur-sm
        ${isCompleted ? "border-primary/30" : "border-border/50"}
        shadow-lg shadow-black/20
      `}
    >
      {/* Match header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-b border-border/30">
        <span className="text-[10px] text-muted-foreground font-medium">
          Match {match.index + 1}
        </span>
        <Badge
          variant={isCompleted ? "default" : "outline"}
          className={`text-[10px] px-1.5 py-0 h-4 ${isCompleted ? "bg-primary/80" : ""}`}
        >
          {isCompleted ? "Completed" : "Pending"}
        </Badge>
      </div>

      {/* Team 1 */}
      <div
        className={`
          flex items-center justify-between px-3 py-2 border-b border-border/20
          ${team1IsWinner ? "bg-primary/10" : ""}
          ${!match.team1Id ? "opacity-50" : ""}
        `}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {team1IsWinner && (
            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          )}
          <span className={`text-sm truncate ${team1IsWinner ? "font-semibold text-primary" : ""}`}>
            {nameFor(match.team1Id)}
          </span>
        </div>
        <span className={`text-sm font-mono ml-2 ${team1IsWinner ? "font-bold text-primary" : "text-muted-foreground"}`}>
          {typeof match.score1 === "number" ? match.score1 : "-"}
        </span>
      </div>

      {/* Team 2 */}
      <div
        className={`
          flex items-center justify-between px-3 py-2
          ${team2IsWinner ? "bg-primary/10" : ""}
          ${!match.team2Id ? "opacity-50" : ""}
        `}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {team2IsWinner && (
            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          )}
          <span className={`text-sm truncate ${team2IsWinner ? "font-semibold text-primary" : ""}`}>
            {nameFor(match.team2Id)}
          </span>
        </div>
        <span className={`text-sm font-mono ml-2 ${team2IsWinner ? "font-bold text-primary" : "text-muted-foreground"}`}>
          {typeof match.score2 === "number" ? match.score2 : "-"}
        </span>
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div className="px-2 py-2 bg-muted/20 border-t border-border/30">
          {match.status !== "completed" && (match.team1Id || match.team2Id) ? (
            <Button
              size="sm"
              variant="default"
              className="w-full h-7 text-xs"
              onClick={() => onReport(match)}
            >
              Report
            </Button>
          ) : match.status === "completed" ? (
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="flex-1 h-6 text-[10px] px-1" onClick={() => onEdit(match)}>
                Edit
              </Button>
              <Button size="sm" variant="outline" className="flex-1 h-6 text-[10px] px-1" onClick={() => onOverride(match)}>
                Override
              </Button>
              <Button size="sm" variant="secondary" className="flex-1 h-6 text-[10px] px-1" onClick={() => onReset(match)}>
                Reset
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function BracketViewer({ tournamentId, initial, isAdmin }: BracketViewerProps) {
  const [bracket, setBracket] = useState<Bracket | null>(initial || null);
  const [reportingMatch, setReportingMatch] = useState<Match | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [overrideMatch, setOverrideMatch] = useState<Match | null>(null);
  const [resettingMatch, setResettingMatch] = useState<Match | null>(null);
  const [overrideWinner, setOverrideWinner] = useState<string>("");
  const score1Ref = useRef<HTMLInputElement | null>(null);
  const score2Ref = useRef<HTMLInputElement | null>(null);
  const editScore1Ref = useRef<HTMLInputElement | null>(null);
  const editScore2Ref = useRef<HTMLInputElement | null>(null);
  const [teamsById, setTeamsById] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!bracket) {
      api
        .getBracket(tournamentId)
        .then(setBracket)
        .catch(() => {});
    }
    const es = api.subscribeBracket(tournamentId, (b: Bracket) => {
      setBracket(b);
    });
    return () => es.close();
  }, [tournamentId]);

  useEffect(() => {
    api
      .getTeams()
      .then((all: Team[]) => {
        const map: Record<string, string> = {};
        all.forEach((t) => {
          map[t.id] = t.name;
        });
        setTeamsById(map);
      })
      .catch(() => {});
  }, []);

  const nameFor = (teamId?: string | null) => {
    if (!teamId) return "TBD";
    return teamsById[teamId] || teamId;
  };

  const beginReport = (m: Match) => {
    if (!isAdmin) return;
    setReportingMatch(m);
  };

  const submitReport = async () => {
    if (!reportingMatch) return;
    const s1 = Number(score1Ref.current?.value);
    const s2 = Number(score2Ref.current?.value);
    if (Number.isNaN(s1) || Number.isNaN(s2)) {
      toast.error("Enter numeric scores");
      return;
    }
    try {
      await api.reportMatch(tournamentId, reportingMatch.id, s1, s2);
      toast.success("Match reported");
      setReportingMatch(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to report");
    }
  };

  const confirmReset = async () => {
    if (!resettingMatch) return;
    try {
      await api.resetMatch(tournamentId, resettingMatch.id);
      toast.success("Match reset");
      setResettingMatch(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to reset match");
    }
  };

  if (!bracket) return <div className="text-sm text-muted-foreground">No bracket yet.</div>;

  // Calculate the card height (including admin buttons if admin)
  const cardHeight = isAdmin ? 130 : 95;
  const connectorWidth = 40;

  return (
    <div className="overflow-x-auto pb-4">
      {(["winners", "losers", "grand"] as const).map((side) =>
        bracket.rounds[side] && bracket.rounds[side].length > 0 ? (
          <div key={side} className="mb-10">
            <h4 className="font-semibold capitalize mb-4 text-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {side === "winners" ? "Winners Bracket" : side === "losers" ? "Losers Bracket" : "Grand Final"}
            </h4>
            
            <div className="relative flex">
              {bracket.rounds[side].map((r, roundIndex) => {
                const isLastRound = roundIndex === bracket.rounds[side].length - 1;
                const spacingMultiplier = Math.pow(2, roundIndex);
                const matchGap = 16 * spacingMultiplier;
                const topOffset = roundIndex === 0 ? 0 : (cardHeight + 16) * (spacingMultiplier - 1) / 2;
                
                return (
                  <div key={`${side}-r${r.round}`} className="flex">
                    {/* Round column */}
                    <div className="flex flex-col">
                      <div className="text-xs text-muted-foreground mb-3 font-medium px-1 h-5">
                        {isLastRound && side === "winners" && bracket.rounds[side].length > 1 ? "Final" : `Round ${r.round}`}
                      </div>
                      <div 
                        className="flex flex-col relative"
                        style={{ 
                          gap: `${matchGap}px`,
                          paddingTop: `${topOffset}px`
                        }}
                      >
                        {r.matches.map((m) => (
                          <MatchCard
                            key={m.id}
                            match={m}
                            nameFor={nameFor}
                            isAdmin={isAdmin}
                            onReport={beginReport}
                            onEdit={setEditingMatch}
                            onOverride={(m) => {
                              setOverrideMatch(m);
                              setOverrideWinner(m.winnerId || "");
                            }}
                            onReset={setResettingMatch}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Connector lines between rounds */}
                    {!isLastRound && (
                      <BracketConnector
                        matchCount={r.matches.length}
                        roundIndex={roundIndex}
                        cardHeight={cardHeight}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null
      )}

      {/* Report Match Dialog */}
      <Dialog
        open={!!reportingMatch}
        onOpenChange={(o) => !o && setReportingMatch(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Match</DialogTitle>
          </DialogHeader>
          {reportingMatch && (
            <div className="space-y-4">
              <div className="text-sm">
                {nameFor(reportingMatch.team1Id)} vs {nameFor(reportingMatch.team2Id)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs mb-1 block">
                    Score {nameFor(reportingMatch.team1Id)}
                  </label>
                  <Input
                    type="number"
                    ref={score1Ref}
                    min={0}
                    defaultValue={0}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block">
                    Score {nameFor(reportingMatch.team2Id)}
                  </label>
                  <Input
                    type="number"
                    ref={score2Ref}
                    min={0}
                    defaultValue={0}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setReportingMatch(null)}
                >
                  Cancel
                </Button>
                <Button onClick={submitReport}>Submit</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Score Dialog */}
      <Dialog open={!!editingMatch} onOpenChange={(o) => !o && setEditingMatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Match Score</DialogTitle>
          </DialogHeader>
          {editingMatch && (
            <div className="space-y-4">
              <div className="text-sm">
                {nameFor(editingMatch.team1Id)} vs {nameFor(editingMatch.team2Id)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs mb-1 block">
                    Score {nameFor(editingMatch.team1Id)}
                  </label>
                  <Input
                    type="number"
                    ref={editScore1Ref}
                    min={0}
                    defaultValue={typeof editingMatch.score1 === "number" ? editingMatch.score1 : 0}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block">
                    Score {nameFor(editingMatch.team2Id)}
                  </label>
                  <Input
                    type="number"
                    ref={editScore2Ref}
                    min={0}
                    defaultValue={typeof editingMatch.score2 === "number" ? editingMatch.score2 : 0}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingMatch(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    const s1 = Number(editScore1Ref.current?.value);
                    const s2 = Number(editScore2Ref.current?.value);
                    if (Number.isNaN(s1) || Number.isNaN(s2)) {
                      toast.error("Enter numeric scores");
                      return;
                    }
                    try {
                      await api.editMatch(tournamentId, editingMatch.id, s1, s2);
                      toast.success("Scores updated");
                      setEditingMatch(null);
                    } catch (e: any) {
                      toast.error(e?.message || "Failed to edit scores");
                    }
                  }}
                >
                  Save
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Override Winner Dialog */}
      <Dialog open={!!overrideMatch} onOpenChange={(o) => !o && setOverrideMatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Winner (Admin)</DialogTitle>
          </DialogHeader>
          {overrideMatch && (
            <div className="space-y-4">
              <div className="text-sm">
                {nameFor(overrideMatch.team1Id)} vs {nameFor(overrideMatch.team2Id)}
              </div>
              <div>
                <label className="text-xs mb-1 block">New Winner</label>
                <Select value={overrideWinner} onValueChange={setOverrideWinner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select winner" />
                  </SelectTrigger>
                  <SelectContent>
                    {overrideMatch.team1Id && (
                      <SelectItem value={overrideMatch.team1Id}>{nameFor(overrideMatch.team1Id)}</SelectItem>
                    )}
                    {overrideMatch.team2Id && (
                      <SelectItem value={overrideMatch.team2Id}>{nameFor(overrideMatch.team2Id)}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs mb-1 block">Score {nameFor(overrideMatch.team1Id)}</label>
                  <Input type="number" min={0} defaultValue={typeof overrideMatch.score1 === "number" ? overrideMatch.score1 : 0} ref={editScore1Ref} />
                </div>
                <div>
                  <label className="text-xs mb-1 block">Score {nameFor(overrideMatch.team2Id)}</label>
                  <Input type="number" min={0} defaultValue={typeof overrideMatch.score2 === "number" ? overrideMatch.score2 : 0} ref={editScore2Ref} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOverrideMatch(null)}>Cancel</Button>
                <Button
                  onClick={async () => {
                    if (!overrideWinner) {
                      toast.error("Pick a winner");
                      return;
                    }
                    const s1 = Number(editScore1Ref.current?.value);
                    const s2 = Number(editScore2Ref.current?.value);
                    try {
                      await api.overrideMatch(tournamentId, overrideMatch.id, overrideWinner, s1, s2);
                      toast.success("Winner overridden");
                      setOverrideMatch(null);
                    } catch (e: any) {
                      toast.error(e?.message || "Failed to override winner");
                    }
                  }}
                >
                  Save
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Match Confirmation */}
      <Dialog open={!!resettingMatch} onOpenChange={(o) => !o && setResettingMatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Match Result</DialogTitle>
          </DialogHeader>
          {resettingMatch && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will clear scores and winner for
                {" "}
                <span className="font-medium">
                  {nameFor(resettingMatch.team1Id)} vs {nameFor(resettingMatch.team2Id)}
                </span>
                . Downstream matches stay untouched, so only use this before results propagate.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setResettingMatch(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmReset}>
                  Confirm Reset
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Connector component that draws bracket lines between rounds
function BracketConnector({ 
  matchCount, 
  roundIndex,
  cardHeight 
}: { 
  matchCount: number; 
  roundIndex: number;
  cardHeight: number;
}) {
  const baseGap = 16;
  const spacingMultiplier = Math.pow(2, roundIndex);
  const gap = baseGap * spacingMultiplier;
  const slotHeight = cardHeight + gap;
  const topOffset = roundIndex === 0 ? 0 : (cardHeight + baseGap) * (spacingMultiplier - 1) / 2;
  
  // Add header offset (round label height + margin)
  const headerOffset = 20 + 12; // text height + mb-3
  
  const paths: JSX.Element[] = [];
  const nextMatchCount = Math.ceil(matchCount / 2);
  
  for (let i = 0; i < nextMatchCount; i++) {
    const topMatchIndex = i * 2;
    const bottomMatchIndex = i * 2 + 1;
    
    // Y positions (center of each card)
    const topMatchY = headerOffset + topOffset + topMatchIndex * slotHeight + cardHeight / 2;
    const bottomMatchY = bottomMatchIndex < matchCount 
      ? headerOffset + topOffset + bottomMatchIndex * slotHeight + cardHeight / 2
      : topMatchY;
    
    const midY = (topMatchY + bottomMatchY) / 2;
    
    if (bottomMatchIndex < matchCount) {
      // Connect two matches to one
      paths.push(
        <path
          key={`connector-${i}`}
          d={`
            M 0 ${topMatchY} 
            H 16 
            V ${midY} 
            H 40
            M 0 ${bottomMatchY} 
            H 16 
            V ${midY}
          `}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeOpacity="0.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    } else {
      // Single match passthrough (bye or odd number)
      paths.push(
        <path
          key={`connector-${i}`}
          d={`M 0 ${topMatchY} H 40`}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeOpacity="0.4"
          strokeLinecap="round"
        />
      );
    }
  }
  
  // Calculate total height needed
  const totalHeight = headerOffset + topOffset + matchCount * slotHeight;
  
  return (
    <svg
      width="40"
      height={totalHeight}
      className="shrink-0"
      style={{ marginTop: 0 }}
    >
      {paths}
    </svg>
  );
}
