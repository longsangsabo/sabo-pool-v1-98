import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  Database, 
  RefreshCw,
  Calendar,
  Settings,
  TrendingUp,
  Trophy,
  Bell
} from 'lucide-react';

interface CronJob {
  jobid: number;
  schedule: string;
  command: string;
  nodename: string;
  nodeport: number;
  database: string;
  username: string;
  active: boolean;
  jobname: string;
}

interface SystemLog {
  id: string;
  log_type: string;
  message: string;
  metadata: any;
  created_at: string;
}

const AutomationMonitor = () => {
  const { user } = useAuth();
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAutomationData = async () => {
    try {
      // Get cron jobs
      const { data: jobs, error: jobsError } = await supabase
        .rpc('get_cron_jobs');
      
      if (jobsError) {
        console.error('Error fetching cron jobs:', jobsError);
      } else {
        setCronJobs(Array.isArray(jobs) ? jobs : []);
      }

      // Get system logs
      const { data: logs, error: logsError } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) {
        console.error('Error fetching system logs:', logsError);
      } else {
        setSystemLogs(logs || []);
      }
    } catch (error) {
      console.error('Error loading automation data:', error);
      toast.error('Lỗi khi tải dữ liệu automation');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAutomationData();
  };

  const runHealthCheck = async () => {
    try {
      const { error } = await supabase.rpc('system_health_check');
      if (error) throw error;
      
      toast.success('Health check executed successfully');
      await loadAutomationData();
    } catch (error) {
      console.error('Error running health check:', error);
      toast.error('Lỗi khi chạy health check');
    }
  };

  const testAutomationFunction = async (functionName: string) => {
    try {
      let result;
      
      switch (functionName) {
        case 'reset_daily_challenges':
          result = await supabase.rpc('reset_daily_challenges');
          break;
        case 'decay_inactive_spa_points':
          result = await supabase.rpc('decay_inactive_spa_points');
          break;
        case 'cleanup_expired_challenges':
          result = await supabase.rpc('cleanup_expired_challenges');
          break;
        case 'update_weekly_leaderboard':
          result = await supabase.rpc('update_weekly_leaderboard');
          break;
        case 'send_monthly_reports':
          result = await supabase.rpc('send_monthly_reports');
          break;
        case 'automated_season_reset':
          result = await supabase.rpc('automated_season_reset');
          break;
        case 'auto_bracket_generation':
          result = await supabase.functions.invoke('auto-bracket-generation');
          break;
        case 'tournament_reminder_system':
          result = await supabase.functions.invoke('tournament-reminder-system');
          break;
        default:
          throw new Error(`Unknown function: ${functionName}`);
      }
      
      if (result.error) throw result.error;
      
      toast.success(`Function ${functionName} executed successfully`);
      await loadAutomationData();
    } catch (error) {
      console.error(`Error testing ${functionName}:`, error);
      toast.error(`Lỗi khi test function ${functionName}`);
    }
  };

  useEffect(() => {
    loadAutomationData();
  }, []);

  const getJobStatusIcon = (active: boolean) => {
    return active ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getLogTypeIcon = (logType: string) => {
    switch (logType) {
      case 'health_check':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'points_decay':
        return <TrendingUp className="w-4 h-4 text-orange-600" />;
      case 'season_reset':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'daily_reset':
        return <RefreshCw className="w-4 h-4 text-green-600" />;
      case 'challenge_cleanup':
        return <Settings className="w-4 h-4 text-gray-600" />;
      default:
        return <Database className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatNextRun = (schedule: string) => {
    // Simple cron schedule display - would need proper cron parser for exact times
    const scheduleMap: { [key: string]: string } = {
      '0 0 * * *': 'Daily at 00:00',
      '0 1 * * *': 'Daily at 01:00', 
      '0 2 * * 0': 'Sunday at 02:00',
      '0 3 * * 1': 'Monday at 03:00',
      '0 4 1 * *': 'Monthly 1st at 04:00',
      '0 5 1 */3 *': 'Quarterly 1st at 05:00',
      '0 6 * * *': 'Daily at 06:00',
      '0 * * * *': 'Every hour'
    };
    
    return scheduleMap[schedule] || schedule;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading automation data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Automation Monitor</h1>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={runHealthCheck}
            variant="outline" 
            size="sm"
          >
            <Activity className="w-4 h-4 mr-2" />
            Run Health Check
          </Button>
        </div>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Scheduled Jobs</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="functions">Test Functions</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="grid gap-4">
            {cronJobs.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No scheduled jobs found</p>
                    <p className="text-sm">Make sure pg_cron is enabled and jobs are created</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              cronJobs.map((job) => (
                <Card key={job.jobid}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getJobStatusIcon(job.active)}
                        {job.jobname || `Job ${job.jobid}`}
                      </CardTitle>
                      <Badge variant={job.active ? "default" : "secondary"}>
                        {job.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Schedule:</span>
                          <p className="text-muted-foreground">{formatNextRun(job.schedule)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Cron Expression:</span>
                          <p className="text-muted-foreground font-mono">{job.schedule}</p>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Command:</span>
                        <p className="text-muted-foreground text-xs font-mono bg-gray-50 p-2 rounded mt-1">
                          {job.command}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="space-y-2">
            {systemLogs.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No system logs found</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              systemLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {getLogTypeIcon(log.log_type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium capitalize">
                            {log.log_type.replace('_', ' ')}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {log.message}
                        </p>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                              View Details
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-50 rounded overflow-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="functions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Automation Functions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => testAutomationFunction('reset_daily_challenges')}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Test Daily Challenge Reset
                </Button>
                
                <Button 
                  onClick={() => testAutomationFunction('decay_inactive_spa_points')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Test Points Decay
                </Button>
                
                <Button 
                  onClick={() => testAutomationFunction('cleanup_expired_challenges')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Test Challenge Cleanup
                </Button>
                
                <Button 
                  onClick={() => testAutomationFunction('update_weekly_leaderboard')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Test Weekly Leaderboard
                </Button>
                
                <Button 
                  onClick={() => testAutomationFunction('send_monthly_reports')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Test Monthly Reports
                </Button>
                
                <Button 
                  onClick={() => testAutomationFunction('auto_bracket_generation')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Test Auto Bracket Generation
                </Button>
                
                <Button 
                  onClick={() => testAutomationFunction('tournament_reminder_system')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Test Tournament Reminders
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Critical Functions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800 mb-3">
                    ⚠️ These functions affect live data. Use with caution.
                  </p>
                  <Button 
                    onClick={() => testAutomationFunction('automated_season_reset')}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Test Season Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationMonitor;