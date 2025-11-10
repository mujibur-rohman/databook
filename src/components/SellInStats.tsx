import { Card, Statistic, Row, Col } from "antd";
import { TrendUp, TrendDown, Calendar, Package } from "@phosphor-icons/react";
import dayjs from "dayjs";

interface SellInStatsProps {
  data: Array<{
    quantity: number;
    sellDate: string;
    branch: { name: string };
    type: { name: string };
  }>;
  loading?: boolean;
}

export default function SellInStats({
  data,
  loading = false,
}: SellInStatsProps) {
  const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);
  const avgQuantity =
    data.length > 0 ? Math.round(totalQuantity / data.length) : 0;

  // Unique branches count
  const uniqueBranches = new Set(data.map((item) => item.branch.name)).size;

  // Unique types count
  const uniqueTypes = new Set(data.map((item) => item.type.name)).size;

  // Latest transaction date
  const latestDate =
    data.length > 0
      ? dayjs(
          Math.max(...data.map((item) => new Date(item.sellDate).getTime()))
        )
      : null;

  // This week's transactions
  const thisWeekStart = dayjs().startOf("week");
  const thisWeekCount = data.filter((item) =>
    dayjs(item.sellDate).isAfter(thisWeekStart)
  ).length;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="Total Quantity"
            value={totalQuantity}
            precision={0}
            valueStyle={{ color: "#3f8600" }}
            prefix={<TrendUp size={16} />}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="Average per Transaction"
            value={avgQuantity}
            precision={0}
            valueStyle={{ color: "#1890ff" }}
            prefix={<TrendDown size={16} />}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="Active Branches"
            value={uniqueBranches}
            precision={0}
            valueStyle={{ color: "#722ed1" }}
            prefix={<Package size={16} />}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="Product Types"
            value={uniqueTypes}
            precision={0}
            valueStyle={{ color: "#eb2f96" }}
            prefix={<Calendar size={16} />}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="This Week"
            value={thisWeekCount}
            precision={0}
            valueStyle={{ color: "#fa8c16" }}
            suffix="transactions"
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card loading={loading}>
          <Statistic
            title="Latest Transaction"
            value={latestDate ? latestDate.format("DD MMM YYYY") : "No data"}
            valueStyle={{ color: "#52c41a", fontSize: "16px" }}
            prefix={<Calendar size={16} />}
          />
        </Card>
      </Col>
    </Row>
  );
}
