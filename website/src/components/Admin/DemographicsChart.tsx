import React from "react"

import { Box, Card, CardHeader, IconButton, Modal, Paper } from "@mui/material"
import { ResponsivePie } from "@nivo/pie"
import { useMeasure } from "@nivo/core"
import { OpenInFull, Close, Download as DownloadIcon } from "@mui/icons-material"
import { useRef } from "react";
import { toPng } from "html-to-image"
import { saveAs } from "file-saver"

type ChartData = (string | null | undefined)[]

type DemographicsChartProps = {
  data: ChartData
  title: string
}

type PieData = {
  id: string
  label: string
  value: number
}

const convertToPieData: (data: ChartData) => PieData[] = (data) => {
  const dataDict = new Map<string, number>()
  data.forEach((val) => {
    if (val) {
      dataDict.set(val, (dataDict.get(val) ?? 0) + 1)
    }
  })
  const pieData: PieData[] = []
  dataDict.forEach((value, key) =>
    pieData.push({
      id: key,
      label: key,
      value: value,
    })
  )
  return pieData
}

type Props = {
  isModal: boolean
  title: string
  pieData: PieData[]
  total: number
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const Chart = ({ isModal,title, pieData, total, setModalOpen }: Props) => {
  
  const chartAreaRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (chartAreaRef.current) {
      const dataUrl = await toPng(chartAreaRef.current, {
        // Need to bypass fonts as 'html-to-image' has trouble parsing font-faces
        // used by Material UI or Nivo
        skipFonts: true,
        cacheBust: true,
        // Filters out icons from img download
        filter: (icon) => !icon?.classList?.contains("MuiIconButton-root"),
        }
      );
      saveAs(dataUrl, `${title} Chart.png`)
  };
};

  return (
    <Card
      ref={chartAreaRef}
      sx={{
        height: 1,
        width: 1,
      }}
    >
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: "h4", textAlign: "center" }}
        action={[
          <IconButton
            key="chart-export"
            onClick={handleDownload}
          >
            {<DownloadIcon />}
          </IconButton>,
          <IconButton
            key="chart-fullscreen"
            onClick={() => setModalOpen(!isModal)}
          >
            {isModal ? <Close /> : <OpenInFull />}
          </IconButton>,
        ]}
      />
      <ResponsivePie
        data={pieData}
        margin={{
          top: isModal ? 80 : 0,
          right: isModal ? 200 : 80,
          bottom: isModal ? 100 : 80,
          left: isModal ? 200 : 80,
        }}
        valueFormat={(value) =>
          `${value} | ${((value / total) * 100).toFixed(1)}%`
        }
        innerRadius={0.5}
        colors={{ scheme: "set2" }}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.2]],
        }}
        arcLinkLabelsSkipAngle={5}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: "color",
          modifiers: [["darker", 2]],
        }}
      />
    </Card>
  )
}

export default function DemographicsChart({
  data,
  title,
}: DemographicsChartProps) {
  const pieData = convertToPieData(data)
  const [ref, { width }] = useMeasure()
  const [modalOpen, setModalOpen] = React.useState(false)
  const handleClose = () => setModalOpen(false)

  return (
    <>
      <Box
        sx={{
          height: width,
        }}
        ref={ref}
      >
        <Chart
          isModal={false}
          title={title}
          pieData={pieData}
          total={data.length}
          setModalOpen={setModalOpen}
        />
      </Box>

      <Modal open={modalOpen} onClose={handleClose}>
        <Paper
          sx={{
            position: "absolute",
            top: "5vh",
            left: "10vw",
            height: "90vh",
            width: "80vw",
            padding: 1,
          }}
        >
        <Chart
          isModal={true}
          title={title}
          pieData={pieData}
          total={data.length}
          setModalOpen={setModalOpen}
        />
        </Paper>
      </Modal>
    </>
  )
}
