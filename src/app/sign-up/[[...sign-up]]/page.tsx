import { SignUp } from "@clerk/nextjs";
import Wordmark from "@/components/Wordmark";
import { EyebrowLabel } from "@/components/ui";

// Same brand token values as sign-in page
const brand = {
  nearBlack:  "#1a1209",
  warmCream:  "#faf8f3",
  warmLinen:  "#ede8e0",
  stone:      "#d8d0c4",
  muted:      "#888888",
  warmGray:   "#5a5a56",
  sage:       "#5c7050",
  danger:     "#a4462f",
  hairline:   "rgba(26, 18, 9, 0.10)",
};

export default function SignUpPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: brand.warmCream,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          marginBottom: 28,
        }}
      >
        <Wordmark size="md" />
        <EyebrowLabel tone="muted">For stylists</EyebrowLabel>
      </div>

      <SignUp
        appearance={{
          variables: {
            colorPrimary:                 brand.nearBlack,
            colorBackground:              brand.warmCream,
            colorText:                    brand.nearBlack,
            colorTextSecondary:           brand.warmGray,
            colorTextOnPrimaryBackground: brand.warmCream,
            colorInputBackground:         "transparent",
            colorInputText:               brand.nearBlack,
            colorInputPlaceholder:        brand.muted,
            colorDanger:                  brand.danger,
            borderRadius:                 "0px",
            fontFamily:                   "'Jost', ui-sans-serif, system-ui, sans-serif",
            fontSize:                     "16px",
            spacingUnit:                  "4px",
          },
          elements: {
            rootBox: {
              width: "100%",
              maxWidth: "400px",
            },
            card: {
              width: "100%",
              background: brand.warmCream,
              border: `1px solid ${brand.stone}`,
              boxShadow: "0 6px 20px rgba(26, 18, 9, 0.08)",
              borderRadius: "0px",
              padding: "36px 32px",
            },

            logoBox:      { display: "none" },
            headerTitle: {
              fontSize:      "24px",
              fontWeight:    "700",
              letterSpacing: "-0.01em",
              color:         brand.nearBlack,
              marginBottom:  "4px",
              textAlign:     "center",
            },
            headerSubtitle: {
              fontSize:  "15px",
              color:     brand.warmGray,
              textAlign: "center",
              lineHeight: "1.5",
            },

            socialButtonsBlockButton: {
              border:       `1.5px solid ${brand.stone}`,
              background:   "transparent",
              color:        brand.nearBlack,
              borderRadius: "0px",
              height:       "46px",
              gap:          "10px",
            },
            socialButtonsBlockButtonText: {
              fontFamily:    "'Jost', ui-sans-serif, system-ui, sans-serif",
              fontWeight:    "700",
              fontSize:      "14px",
              letterSpacing: "0.04em",
            },
            socialButtonsProviderIcon: {
              width: "18px",
              height: "18px",
            },

            dividerLine: { background: brand.hairline },
            dividerText: {
              color:         brand.muted,
              fontSize:      "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            },

            formFieldLabel: {
              fontFamily:    "'Jost', ui-sans-serif, system-ui, sans-serif",
              fontSize:      "11px",
              fontWeight:    "500",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color:         brand.warmGray,
              marginBottom:  "7px",
            },
            formFieldInput: {
              border:       `1px solid ${brand.stone}`,
              background:   "transparent",
              borderRadius: "0px",
              fontSize:     "16px",
              color:        brand.nearBlack,
              padding:      "13px 14px",
              boxShadow:    "none",
              outline:      "none",
              fontFamily:   "'Jost', ui-sans-serif, system-ui, sans-serif",
            },
            formFieldInputShowPasswordButton: {
              color: brand.warmGray,
            },

            formButtonPrimary: {
              background:    brand.nearBlack,
              color:         brand.warmCream,
              border:        `1.5px solid ${brand.nearBlack}`,
              borderRadius:  "0px",
              fontFamily:    "'Jost', ui-sans-serif, system-ui, sans-serif",
              fontWeight:    "700",
              fontSize:      "15px",
              letterSpacing: "0.04em",
              height:        "50px",
              boxShadow:     "none",
            },

            footerActionLink: {
              color:      brand.sage,
              fontWeight: "500",
            },
            footer: {
              background:  brand.warmCream,
              borderTop:   `1px solid ${brand.hairline}`,
              marginTop:   "4px",
              paddingTop:  "16px",
            },
            footerPages:  { background: brand.warmCream },
            footerAction: { background: brand.warmCream },
            main:         { background: brand.warmCream },

            identityPreviewText: { color: brand.nearBlack },
            formFieldErrorText: {
              color:    brand.danger,
              fontSize: "12px",
            },
            alertText: { fontSize: "14px" },
          },
        }}
      />
    </main>
  );
}
