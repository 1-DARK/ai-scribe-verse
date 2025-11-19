import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartFullscreenViewer } from './ChartFullscreenViewer';
import { Maximize2 } from 'lucide-react';

interface NumericalAnalysisProps {
  data: {
    type: 'numerical_analysis';
    summary: string;
    dataset_preview?: any[];
    column_types?: { numerical: string[] };
    analysis?: {
      summary_stats?: any;
      missing_values?: Record<string, number>;
      correlation_matrix?: any;
      outliers?: Record<string, number>;
    };
    plots?: Record<string, string>;
  };
}

export const NumericalAnalysisDisplay = ({ data }: NumericalAnalysisProps) => {
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; title: string } | null>(null);

  return (
    <div className="space-y-3 md:space-y-4 w-full max-w-full overflow-hidden">

      {/* Column Types */}
      {data.column_types?.numerical && data.column_types.numerical.length > 0 && (
        <Card className="bg-gradient-to-b from-zinc-800 to-zinc-900 max-w-full">
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="text-sm md:text-lg">Numerical Columns</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <div className="flex flex-wrap gap-2">
              {data.column_types.numerical.map((col, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {col}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dataset Preview */}
      {data.dataset_preview && data.dataset_preview.length > 0 && (
        <Card className="bg-gradient-to-b from-zinc-800 to-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg">Dataset Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(data.dataset_preview[0]).map((key) => (
                      <TableHead key={key} className="text-gray-300">{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.dataset_preview.map((row, idx) => (
                    <TableRow key={idx}>
                      {Object.values(row).map((val: any, cellIdx) => (
                        <TableCell key={cellIdx} className="text-gray-400">
                          {typeof val === 'number' ? val.toFixed(2) : String(val)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      {data.analysis?.summary_stats && Object.keys(data.analysis.summary_stats).length > 0 && (
        <Card className="bg-gradient-to-b from-zinc-800 to-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg">Summary Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Metric</TableHead>
                    {Object.keys(data.analysis.summary_stats).map((col) => (
                      <TableHead key={col} className="text-gray-300">{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'].map((stat) => (
                    <TableRow key={stat}>
                      <TableCell className="font-medium text-gray-300">{stat}</TableCell>
                      {Object.keys(data.analysis.summary_stats).map((col) => (
                        <TableCell key={col} className="text-gray-400">
                          {typeof data.analysis.summary_stats[col][stat] === 'number'
                            ? data.analysis.summary_stats[col][stat].toFixed(2)
                            : data.analysis.summary_stats[col][stat]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing Values & Outliers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.analysis?.missing_values && (
          <Card className="bg-gradient-to-b from-zinc-800 to-zinc-900">
            <CardHeader>
              <CardTitle className="text-lg">Missing Values</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.analysis.missing_values).map(([col, count]) => (
                  <div key={col} className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">{col}</span>
                    <Badge variant={count > 0 ? 'destructive' : 'secondary'} className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {data.analysis?.outliers && (
          <Card className="bg-gradient-to-b from-zinc-800 to-zinc-900">
            <CardHeader>
              <CardTitle className="text-lg">Outliers Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.analysis.outliers).map(([col, count]) => (
                  <div key={col} className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">{col}</span>
                    <Badge variant={count > 0 ? 'destructive' : 'secondary'} className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Plots */}
      {data.plots && Object.keys(data.plots).length > 0 && (
        <Card className="bg-gradient-to-b from-zinc-800 to-zinc-900 max-w-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm md:text-lg">Visualizations</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {Object.entries(data.plots).map(([name, base64]) => {
                const imageUrl = `data:image/png;base64,${base64}`;
                return (
                  <div key={name} className="space-y-2 max-w-full overflow-hidden">
                    <h4 className="text-xs md:text-sm font-medium text-gray-300 capitalize px-1">
                      {name.replace(/_/g, ' ')}
                    </h4>
                    <div className="w-full max-w-full overflow-hidden relative group">
                      <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-auto max-w-full rounded-lg border border-border object-contain cursor-pointer transition-opacity hover:opacity-90"
                        onClick={() => setFullscreenImage({ url: imageUrl, title: name })}
                      />
                      <button
                        onClick={() => setFullscreenImage({ url: imageUrl, title: name })}
                        className="absolute top-2 right-2 p-1.5 md:p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
                        aria-label="View fullscreen"
                      >
                        <Maximize2 className="h-3 w-3 md:h-4 md:w-4 text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fullscreen Viewer */}
      <ChartFullscreenViewer
        imageUrl={fullscreenImage?.url || ''}
        title={fullscreenImage?.title || ''}
        isOpen={!!fullscreenImage}
        onClose={() => setFullscreenImage(null)}
      />

         {/* Summary */}
         {data.summary && (
        <Card className="bg-gradient-to-b from-zinc-800 to-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
               Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300 leading-relaxed">{data.summary}</p>
          </CardContent>
        </Card>
      )}
    </div>

  );
};
