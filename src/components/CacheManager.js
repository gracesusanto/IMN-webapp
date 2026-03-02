import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  Paper,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Storage as StorageIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { getCacheStats, clearAllCache } from '../utils/cacheUtils';

/**
 * Cache Manager Component - For debugging and manual cache management
 * Add this to any page during development to monitor and control cache
 */
export default function CacheManager({ useApiInstances = [], position = 'bottom-right' }) {
  const [open, setOpen] = useState(false);
  const [cacheStats, setCacheStats] = useState({ memory: { size: 0 }, localStorage: { size: 0 } });

  // Calculate cache statistics
  const updateCacheStats = () => {
    const stats = getCacheStats();
    setCacheStats(stats);
  };

  useEffect(() => {
    updateCacheStats();
    const interval = setInterval(updateCacheStats, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  // Position styles
  const positionStyles = {
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'top-right': { top: 20, right: 20 },
    'top-left': { top: 20, left: 20 },
  };

  const handleClearAll = () => {
    clearAllCache();
    updateCacheStats();
  };

  const handleClearModel = (modelName, clearCache) => {
    clearCache();
    updateCacheStats();
  };

  const handleRefreshModel = (modelName, refreshData) => {
    refreshData();
    updateCacheStats();
  };

  return (
    <>
      {/* Floating Action Button */}
      <Box
        sx={{
          position: 'fixed',
          zIndex: 1300,
          ...positionStyles[position],
        }}
      >
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            backgroundColor: '#3b82f6',
            color: 'white',
            boxShadow: 3,
            '&:hover': {
              backgroundColor: '#2563eb',
            },
          }}
        >
          <StorageIcon />
        </IconButton>
      </Box>

      {/* Cache Management Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <StorageIcon />
            <Typography variant="h6">Cache Manager</Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* Cache Statistics */}
            <Paper sx={{ p: 2, bgcolor: '#f8fafc' }}>
              <Typography variant="subtitle1" gutterBottom>
                📊 Cache Statistics
              </Typography>
              <Stack direction="row" spacing={2}>
                <Chip
                  label={`Memory: ${cacheStats.memory.size} entries`}
                  color="primary"
                  size="small"
                />
                <Chip
                  label={`LocalStorage: ${cacheStats.localStorage.size} entries`}
                  color="secondary"
                  size="small"
                />
              </Stack>
            </Paper>

            {/* Global Actions */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                🌐 Global Cache Actions
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={handleClearAll}
                  color="error"
                >
                  Clear All Cache
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={updateCacheStats}
                >
                  Refresh Stats
                </Button>
              </Stack>
            </Paper>

            {/* Per-Model Actions */}
            {useApiInstances.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  🔧 Model-Specific Actions
                </Typography>

                {useApiInstances.map((instance, index) => (
                  <Accordion key={index} sx={{ mt: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="subtitle2">
                          {instance.modelName || `Model ${index + 1}`}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${instance.data?.length || 0} records`}
                          color="info"
                        />
                        {instance.loading && (
                          <Chip
                            size="small"
                            label="Loading..."
                            color="warning"
                          />
                        )}
                      </Stack>
                    </AccordionSummary>

                    <AccordionDetails>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleClearModel(instance.modelName, instance.clearCache)}
                        >
                          Clear Cache
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<RefreshIcon />}
                          onClick={() => handleRefreshModel(instance.modelName, instance.refreshData)}
                        >
                          Refresh Data
                        </Button>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Paper>
            )}

            {/* Cache Configuration Info */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <InfoIcon />
                  <Typography variant="subtitle2">Cache Configuration</Typography>
                </Stack>
              </AccordionSummary>

              <AccordionDetails>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Tooling:</strong> 10 min TTL + smart server validation
                  </Typography>
                  <Typography variant="body2">
                    <strong>Mesin:</strong> 10 min TTL + smart server validation
                  </Typography>
                  <Typography variant="body2">
                    <strong>Operator:</strong> 15 min TTL + smart server validation
                  </Typography>
                  <Typography variant="body2">
                    <strong>Reports:</strong> 2 min TTL, memory only
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', pt: 1 }}>
                    Smart validation: Quick server timestamp check before using cache
                  </Typography>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Debug Information */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="subtitle2">🐛 Debug Information</Typography>
                </Stack>
              </AccordionSummary>

              <AccordionDetails>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Memory Cache Keys:</strong>
                  </Typography>
                  {cacheStats.memory.entries?.length > 0 ? (
                    cacheStats.memory.entries.map((key, idx) => (
                      <Typography key={idx} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', pl: 2 }}>
                        {key}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ pl: 2, fontStyle: 'italic' }}>
                      No memory cache entries
                    </Typography>
                  )}

                  <Typography variant="body2" sx={{ pt: 1 }}>
                    <strong>LocalStorage Cache Keys:</strong>
                  </Typography>
                  {cacheStats.localStorage.entries?.length > 0 ? (
                    cacheStats.localStorage.entries.map((key, idx) => (
                      <Typography key={idx} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', pl: 2 }}>
                        {key}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ pl: 2, fontStyle: 'italic' }}>
                      No localStorage cache entries
                    </Typography>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/**
 * Hook to provide cache manager data
 * Usage in your pages:
 *
 * const toolingApi = useApi('tooling');
 * const mesinApi = useApi('mesin');
 *
 * const cacheInstances = [
 *   { ...toolingApi, modelName: 'tooling' },
 *   { ...mesinApi, modelName: 'mesin' },
 * ];
 *
 * return (
 *   <div>
 *     Your page content
 *     <CacheManager useApiInstances={cacheInstances} />
 *   </div>
 * );
 */