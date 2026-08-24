export const buildEmailWithEmployeeInformation = (
  employee: {
    name: string
    _count: { proposalsManager: number }
  },
  url: string,
): string => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f8; padding:40px 20px;">
    <tr>
      <td align="center">

        <!-- Main container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px; background:#111827; text-align:center;">
              <div style="
                display:inline-block;
                width:48px;
                height:48px;
                line-height:48px;
                border-radius:12px;
                background:#2563eb;
                color:#ffffff;
                font-size:22px;
                font-weight:bold;
              ">
                P
              </div>

              <h1 style="
                margin:16px 0 0;
                color:#ffffff;
                font-size:24px;
                font-weight:600;
              ">
                ePIC
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">

              <h2 style="
                margin:0 0 16px;
                font-size:22px;
                color:#111827;
              ">
                Sugestões Abertas
              </h2>

              <p style="
                margin:0 0 20px;
                font-size:15px;
                line-height:1.7;
                color:#4b5563;
              ">
                Olá <strong>${employee.name}</strong>,
              </p>

              <p style="
                margin:0 0 24px;
                font-size:15px;
                line-height:1.7;
                color:#4b5563;
              ">
                Existem <span style="font-weight:600; text-color:#FFF">${employee._count.proposalsManager}</span> sugestões abertas que precisam da sua atenção. Por favor, clique no botão abaixo para acessar o sistema e revisar as sugestões pendentes.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" style="border-radius:8px; background:#2563eb;">
                    <a href="${url}"
                      style="
                        display:inline-block;
                        padding:14px 28px;
                        font-size:15px;
                        font-weight:600;
                        color:#ffffff;
                        text-decoration:none;
                        border-radius:8px;
                      ">
                      Acessar Sugestões
                    </a>
                  </td>
                </tr>
              </table>

              <p style="
                margin:0 0 12px;
                font-size:13px;
                line-height:1.6;
                color:#6b7280;
              ">
                Lembre-se de que o prazo para resposta é de <strong>14 dias</strong>.
              </p>

              <!-- Divider -->
              <div style="
                height:1px;
                background:#e5e7eb;
                margin:32px 0;
              "></div>

              <p style="
                margin:0;
                font-size:12px;
                line-height:1.6;
                color:#9ca3af;
              ">
                Se o botão não funcionar, copie e cole o seguinte
                link no seu navegador:
              </p>

              <p style="
                margin:8px 0 0;
                font-size:12px;
                line-height:1.6;
                word-break:break-all;
              ">
                <a href="${url}" style="color:#2563eb;">
                  ${url}
                </a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding:24px 40px;
              background:#f9fafb;
              text-align:center;
            ">
              <p style="
                margin:0 0 6px;
                font-size:12px;
                color:#9ca3af;
              ">
                © 2026 ePIC
              </p>

              <p style="
                margin:0;
                font-size:12px;
                color:#9ca3af;
              ">
                Essa é uma mensagem automatizada. Por favor, não responda.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`
