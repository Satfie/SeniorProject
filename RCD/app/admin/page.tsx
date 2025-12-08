"use client"

import { useEffect, useRef, useState } from "react";
import { api, type User, type Team, type Tournament } from "@/lib/api"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Users, Trophy, Trash2, Edit, Plus, Search, Activity, AlertTriangle, FileText } from "lucide-react"
import { CommonSetups } from "@/components/admin/common-setups"
import { validateTournamentConfig } from "@/lib/tournament-rules"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { AnimatedSection } from "@/components/ui/animated-section"

function AdminContent() {
  const searchParams = useSearchParams()
  const defaultTab = (searchParams && searchParams.get("tab")) || "users";

  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const lastAuditIdRef = useRef<string | null>(null);
  const [enableLiveLogs, setEnableLiveLogs] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // User management state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [newRole, setNewRole] = useState<User["role"]>("player");

  // Tournament management state
  const [showTournamentDialog, setShowTournamentDialog] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(
    null
  );
  const [tournamentForm, setTournamentForm] = useState({
    title: "",
    description: "",
    date: "",
    type: "single-elimination",
    status: "upcoming" as Tournament["status"],
    maxParticipants: "",
    prizePool: "",
    game: "",
    rosterSize: "5",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, teamsData, tournamentsData, logsData] =
        await Promise.all([
          api.getUsers(),
          api.getTeams(),
          api.getTournaments(),
          api.getAuditLogs().catch(() => []),
        ]);
      setUsers(usersData);
      setTeams(teamsData);
      setTournaments(tournamentsData);
      setAuditLogs(logsData);
      if (logsData && logsData.length) {
        // Remember newest identifier (timestamp+action) as a composite key
        const newest = logsData[0];
        lastAuditIdRef.current = `${newest.timestamp}-${newest.action}`;
      }
    } catch (error) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUserRole = async () => {
    if (!selectedUser) return;

    try {
      await api.changeUserRole(selectedUser.id, newRole);
      toast.success("User role updated successfully");
      setShowUserDialog(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.deleteUser(userId);
      toast.success("User deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;

    try {
      await api.deleteTeam(teamId);
      toast.success("Team deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete team");
    }
  };

  const handleSaveTournament = async () => {
    if (!tournamentForm.title || !tournamentForm.date) {
      toast.error("Title and date are required");
      return;
    }

    try {
      const data = {
        ...tournamentForm,
        maxParticipants: tournamentForm.maxParticipants
          ? Number.parseInt(tournamentForm.maxParticipants)
          : undefined,
        rosterSize: tournamentForm.rosterSize
          ? Number.parseInt(tournamentForm.rosterSize)
          : undefined,
      };

      const validation = validateTournamentConfig({
        game: data.game,
        participants: data.maxParticipants,
        teams: data.maxParticipants,
        rosterSize: data.rosterSize,
        formatType: data.type as any,
        maxParticipants: data.maxParticipants,
      })
      if (!validation.valid) {
        toast.error(validation.reason || "Invalid tournament configuration")
        return
      }

      if (editingTournament) {
        await api.updateTournament(editingTournament.id, data);
        toast.success("Tournament updated successfully");
      } else {
        await api.createTournament(data);
        toast.success("Tournament created successfully");
      }

      setShowTournamentDialog(false);
      setEditingTournament(null);
      setTournamentForm({
        title: "",
        description: "",
        date: "",
        type: "single-elimination",
        status: "upcoming",
        maxParticipants: "",
        prizePool: "",
        game: "",
        rosterSize: "5",
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save tournament");
    }
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    if (!confirm("Are you sure you want to delete this tournament?")) return;

    try {
      await api.deleteTournament(tournamentId);
      toast.success("Tournament deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete tournament");
    }
  };

  const openEditTournament = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setTournamentForm({
      title: tournament.title,
      description: tournament.description || "",
      date: tournament.date,
      type: tournament.type,
      status: tournament.status,
      maxParticipants: tournament.maxParticipants?.toString() || "",
      prizePool: tournament.prizePool || "",
      game: tournament.game || "",
      rosterSize: tournament.rosterSize?.toString() || "",
    });
    setShowTournamentDialog(true);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTournaments = tournaments.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Live audit log polling (fallback to polling; SSE could be added later)
  useEffect(() => {
    if (!enableLiveLogs) return;
    const interval = setInterval(async () => {
      try {
        const logs = await api.getAuditLogs().catch(() => []);
        if (!Array.isArray(logs) || logs.length === 0) return;
        const newest = logs[0];
        const newKey = `${newest.timestamp}-${newest.action}`;
        if (lastAuditIdRef.current && newKey !== lastAuditIdRef.current) {
          // Find all logs that are newer than stored ref
          const idx = logs.findIndex(
            (l: any) => `${l.timestamp}-${l.action}` === lastAuditIdRef.current
          );
          const fresh = idx === -1 ? logs : logs.slice(0, idx);
          fresh.reverse().forEach((log: any) => {
            toast.info(`${log.action.replace(/_/g, " ")}`, {
              description:
                log.details || new Date(log.timestamp).toLocaleTimeString(),
            });
          });
        }
        lastAuditIdRef.current = newKey;
        setAuditLogs(logs);
      } catch (_) {
        /* silent */
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [enableLiveLogs]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="relative h-[250px] w-full overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-destructive/20 via-purple-900/20 to-background z-10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-destructive/10 rounded-full blur-3xl animate-pulse-glow"></div>

        <div className="container mx-auto px-4 h-full relative z-20 flex flex-col justify-center">
          <AnimatedSection>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-destructive/20 backdrop-blur border border-destructive/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-foreground drop-shadow-lg">
                  Admin Panel
                </h1>
                <p className="text-lg text-muted-foreground">
                  System management and oversight
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-30">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <AnimatedSection delay={100}>
            <Card className="border-primary/10 bg-card/40 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                <Users className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{users.length}</div>
              </CardContent>
            </Card>
          </AnimatedSection>
          <AnimatedSection delay={150}>
            <Card className="border-primary/10 bg-card/40 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Teams</CardTitle>
                <Shield className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{teams.length}</div>
              </CardContent>
            </Card>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <Card className="border-primary/10 bg-card/40 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Tournaments
                </CardTitle>
                <Trophy className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{tournaments.length}</div>
              </CardContent>
            </Card>
          </AnimatedSection>
          <AnimatedSection delay={250}>
            <Card className="border-primary/10 bg-card/40 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Tournaments
                </CardTitle>
                <Activity className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-green-500">
                  {
                    tournaments.filter(
                      (t) => t.status === "ongoing" || t.status === "upcoming"
                    ).length
                  }
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>

        {/* Main Content */}
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <AnimatedSection delay={300}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <TabsList className="bg-card/50 backdrop-blur border border-white/10 p-1 h-auto rounded-xl inline-flex">
                <TabsTrigger value="users" className="px-4 py-2 rounded-lg">Users</TabsTrigger>
                <TabsTrigger value="teams" className="px-4 py-2 rounded-lg">Teams</TabsTrigger>
                <TabsTrigger value="tournaments" className="px-4 py-2 rounded-lg">Tournaments</TabsTrigger>
                <TabsTrigger value="audit" className="px-4 py-2 rounded-lg">Audit Logs</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-card/40 backdrop-blur border border-white/10 rounded-xl">
                <Activity className={`w-4 h-4 ${enableLiveLogs ? "text-green-500 animate-pulse" : "text-muted-foreground"}`} />
                <label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableLiveLogs}
                    onChange={(e) => setEnableLiveLogs(e.target.checked)}
                    className="rounded border-muted-foreground bg-transparent"
                  />
                  Live Logs
                </label>
              </div>
            </div>
          </AnimatedSection>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4 mt-0">
            <AnimatedSection>
              <Card className="border-primary/10 bg-card/40 backdrop-blur">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>
                        Manage user accounts and permissions
                      </CardDescription>
                    </div>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-background/50 border-white/10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-12">Loading...</div>
                  ) : (
                    <div className="rounded-md border border-white/10 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/20">
                          <TableRow className="hover:bg-transparent border-white/10">
                            <TableHead>Email</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow key={user.id} className="hover:bg-white/5 border-white/10">
                              <TableCell className="font-medium">
                                {user.email}
                              </TableCell>
                              <TableCell>{user.username || "-"}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize bg-white/5 border-white/10">
                                  {user.role.replace("_", " ")}
                                </Badge>
                              </TableCell>
                              <TableCell>{user.teamId || "-"}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setNewRole(user.role);
                                      setShowUserDialog(true);
                                    }}
                                    className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary"
                                  >
                                    <Shield className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-4 mt-0">
            <AnimatedSection>
              <Card className="border-primary/10 bg-card/40 backdrop-blur">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Team Management</CardTitle>
                      <CardDescription>
                        Manage teams and their members
                      </CardDescription>
                    </div>
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search teams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-background/50 border-white/10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-12">Loading...</div>
                  ) : (
                    <div className="rounded-md border border-white/10 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/20">
                          <TableRow className="hover:bg-transparent border-white/10">
                            <TableHead>Name</TableHead>
                            <TableHead>Tag</TableHead>
                            <TableHead>Members</TableHead>
                            <TableHead>Games Played</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTeams.map((team) => (
                            <TableRow key={team.id} className="hover:bg-white/5 border-white/10">
                              <TableCell className="font-medium">
                                {team.name}
                              </TableCell>
                              <TableCell>
                                {team.tag ? (
                                  <Badge variant="outline" className="bg-white/5 border-white/10">{team.tag}</Badge>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell>{team.members?.length || 0}</TableCell>
                              <TableCell>{team.gamesPlayed || 0}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteTeam(team.id)}
                                  className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          </TabsContent>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="space-y-4 mt-0">
            <AnimatedSection>
              <Card className="border-primary/10 bg-card/40 backdrop-blur">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Tournament Management</CardTitle>
                      <CardDescription>
                        Create and manage tournaments
                      </CardDescription>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search tournaments..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-background/50 border-white/10"
                        />
                      </div>
                      <Button onClick={() => setShowTournamentDialog(true)} className="shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Create
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-12">Loading...</div>
                  ) : (
                    <div className="rounded-md border border-white/10 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/20">
                          <TableRow className="hover:bg-transparent border-white/10">
                            <TableHead>Title</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Participants</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTournaments.map((tournament) => (
                            <TableRow key={tournament.id} className="hover:bg-white/5 border-white/10">
                              <TableCell className="font-medium">
                                {tournament.title}
                              </TableCell>
                              <TableCell>
                                {new Date(tournament.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    tournament.status === "upcoming"
                                      ? "default"
                                      : tournament.status === "ongoing"
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className="capitalize"
                                >
                                  {tournament.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {tournament.currentParticipants || 0}
                                {tournament.maxParticipants
                                  ? ` / ${tournament.maxParticipants}`
                                  : ""}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openEditTournament(tournament)}
                                    className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleDeleteTournament(tournament.id)
                                    }
                                    className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-4 mt-0">
            <AnimatedSection>
              <Card className="border-primary/10 bg-card/40 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Audit Logs
                  </CardTitle>
                  <CardDescription>
                    View system activity and user actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {auditLogs.length > 0 ? (
                    <div className="rounded-md border border-white/10 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/20">
                          <TableRow className="hover:bg-transparent border-white/10">
                            <TableHead>Timestamp</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Details</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {auditLogs.map((log, index) => (
                            <TableRow key={index} className="hover:bg-white/5 border-white/10">
                              <TableCell className="text-muted-foreground text-xs">
                                {new Date(log.timestamp).toLocaleString()}
                              </TableCell>
                              <TableCell className="font-medium">{log.user}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-white/5 border-white/10">
                                  {log.action}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {log.details}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-background/30 rounded-xl border border-dashed border-white/10">
                      <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        No audit logs available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          </TabsContent>
        </Tabs>

        {/* Change User Role Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Update the role for {selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="role">Select Role</Label>
              <Select
                value={newRole}
                onValueChange={(value) => setNewRole(value as User["role"])}
              >
                <SelectTrigger id="role" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">Player</SelectItem>
                  <SelectItem value="team_manager">Team Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleChangeUserRole}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create/Edit Tournament Dialog */}
        <Dialog
          open={showTournamentDialog}
          onOpenChange={setShowTournamentDialog}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTournament ? "Edit Tournament" : "Create Tournament"}
              </DialogTitle>
              <DialogDescription>
                {editingTournament
                  ? "Update tournament details"
                  : "Fill in the tournament information"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={tournamentForm.title}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        title: e.target.value,
                      })
                    }
                    placeholder="Tournament name"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={tournamentForm.date}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        date: e.target.value,
                      })
                    }
                    className="bg-background/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={tournamentForm.description}
                  onChange={(e) =>
                    setTournamentForm({
                      ...tournamentForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Tournament description"
                  className="bg-background/50"
                />
              </div>
              {/* Common Setups */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <CommonSetups
                    game={tournamentForm.game}
                    applyPreset={(p) =>
                      setTournamentForm({
                        ...tournamentForm,
                        type: p.formatType,
                        maxParticipants: String(p.teams),
                        rosterSize: String(p.rosterSize),
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={tournamentForm.type}
                    onValueChange={(value) =>
                      setTournamentForm({ ...tournamentForm, type: value })
                    }
                  >
                    <SelectTrigger id="type" className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-elimination">Single Elimination</SelectItem>
                      {/* Double elim allowed only if power-of-two and >=4 */}
                      <SelectItem
                        value="double-elimination"
                        disabled={(() => {
                          const n = Number(tournamentForm.maxParticipants || 0)
                          const okInt = Number.isInteger(n) && n > 0
                          const isPow2 = okInt && (n & (n - 1)) === 0
                          return !okInt || n < 4 || !isPow2
                        })()}
                      >
                        Double Elimination
                      </SelectItem>
                      <SelectItem value="round-robin">Round Robin</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Double Elimination requires power-of-two teams and at least 4 (e.g., 4, 8, 16).
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={tournamentForm.status}
                    onValueChange={(value) =>
                      setTournamentForm({
                        ...tournamentForm,
                        status: value as Tournament["status"],
                      })
                    }
                  >
                    <SelectTrigger id="status" className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="game">Game</Label>
                  <Input
                    id="game"
                    value={tournamentForm.game}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        game: e.target.value,
                      })
                    }
                    placeholder="e.g., Rocket League"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={tournamentForm.maxParticipants}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        maxParticipants: e.target.value,
                      })
                    }
                    placeholder="e.g., 32"
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    For Double Elimination choose power-of-two (4, 8, 16). Single Elimination allows non-power-of-two; BYEs are added.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rosterSize">Team Size (players)</Label>
                  <Input
                    id="rosterSize"
                    type="number"
                    min={1}
                    max={10}
                    value={tournamentForm.rosterSize}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        rosterSize: e.target.value,
                      })
                    }
                    placeholder="e.g., 5 for 5v5"
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose how many players each team fields (use 1 for 1v1, 2 for 2v2, etc.). Leave blank for flexible teams.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Valid roster size is 1–10. Common presets enforce typical values per game.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prizePool">Prize Pool</Label>
                <Input
                  id="prizePool"
                  value={tournamentForm.prizePool}
                  onChange={(e) =>
                    setTournamentForm({
                      ...tournamentForm,
                      prizePool: e.target.value,
                    })
                  }
                  placeholder="e.g., $10,000"
                  className="bg-background/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowTournamentDialog(false);
                  setEditingTournament(null);
                  setTournamentForm({
                    title: "",
                    description: "",
                    date: "",
                    type: "single-elimination",
                    status: "upcoming",
                    maxParticipants: "",
                    prizePool: "",
                    game: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveTournament}>
                {editingTournament ? "Update Tournament" : "Create Tournament"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAuth allowedRoles={["admin"]}>
      <AdminContent />
    </ProtectedRoute>
  )
}
